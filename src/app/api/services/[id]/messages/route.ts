import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/api-errors"
import { requireSessionUser } from "@/lib/session"
import { createAdminNotification, createUserNotification } from "@/lib/notifications"
import { logUserActivity } from "@/lib/activity"
import { serviceRequestStatuses } from "@/lib/service-requests"

const attachmentSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]),
  url: z.string().startsWith("/uploads/"),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().nonnegative().max(50 * 1024 * 1024).optional(),
})

const postMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  attachments: z.array(attachmentSchema).max(10).optional().default([]),
  nextStatus: z.enum(serviceRequestStatuses).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser()
    const { id } = await params
    const body = await req.json()
    const parsed = postMessageSchema.parse(body)

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        title: true,
        status: true,
      },
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, message: "Service request not found." },
        { status: 404 }
      )
    }

    const isAdmin = session.role === "ADMIN"
    const isOwner = serviceRequest.userId === session.userId
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      )
    }

    const shouldChangeStatus = Boolean(parsed.nextStatus && parsed.nextStatus !== serviceRequest.status)

    const message = await prisma.serviceRequestMessage.create({
      data: {
        requestId: id,
        senderId: session.userId,
        message: parsed.message,
        attachments: {
          create: parsed.attachments.map((file) => ({
            uploaderId: session.userId,
            type: file.type,
            url: file.url,
            fileName: file.fileName,
            fileSize: file.fileSize ?? null,
          })),
        },
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
        attachments: true,
      },
    })

    const timelineCreates = [
      {
        actorId: session.userId,
        eventType: "MESSAGE_SENT",
        message: isAdmin ? "Admin replied to request." : "User replied to request.",
        includeStatus: false,
      },
    ]

    if (shouldChangeStatus && parsed.nextStatus) {
      timelineCreates.push({
        actorId: session.userId,
        eventType: "STATUS_CHANGED",
        message: `Status changed to ${parsed.nextStatus.replaceAll("_", " ")}.`,
        includeStatus: true,
      })
    }

    await prisma.serviceRequest.update({
      where: { id: serviceRequest.id },
      data: {
        status: shouldChangeStatus ? parsed.nextStatus : undefined,
        timelineEvents: {
          create: timelineCreates.map((event) => ({
            actorId: event.actorId,
            eventType: event.eventType,
            message: event.message,
            statusFrom: event.includeStatus ? serviceRequest.status : undefined,
            statusTo: event.includeStatus ? parsed.nextStatus : undefined,
          })),
        },
      },
    })

    if (isAdmin) {
      await createUserNotification(
        serviceRequest.userId,
        "SERVICE_REQUEST_REPLY",
        "New admin response",
        `Admin replied on your request "${serviceRequest.title}".`,
        "SERVICE_REQUEST",
        serviceRequest.id
      )
      if (shouldChangeStatus && parsed.nextStatus) {
        await createUserNotification(
          serviceRequest.userId,
          "SERVICE_REQUEST_STATUS",
          "Request status updated",
          `Your request "${serviceRequest.title}" is now ${parsed.nextStatus.replaceAll("_", " ")}.`,
          "SERVICE_REQUEST",
          serviceRequest.id
        )
      }
    } else {
      await createAdminNotification(
        "SERVICE_REQUEST_REPLY",
        "User replied to service request",
        `User replied on "${serviceRequest.title}".`,
        "SERVICE_REQUEST",
        serviceRequest.id
      )
    }

    await logUserActivity(session.userId, "SERVICE_REQUEST_MESSAGE_SENT", {
      serviceRequestId: serviceRequest.id,
      asAdmin: isAdmin,
      changedStatus: shouldChangeStatus,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Reply sent successfully.",
        entry: message,
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
