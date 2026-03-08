import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"
import { createUserNotification } from "@/lib/notifications"
import { logUserActivity } from "@/lib/activity"
import { serviceRequestStatuses } from "@/lib/service-requests"

const schema = z.object({
  status: z.enum(serviceRequestStatuses),
})

function statusUpdateMessage(status: (typeof serviceRequestStatuses)[number]) {
  switch (status) {
    case "UNDER_REVIEW":
      return "Your request is under review."
    case "IN_PROGRESS":
      return "Your request is now being processed."
    case "WAITING_FOR_USER":
      return "Your request needs additional input from you."
    case "COMPLETED":
      return "Your request has been completed."
    case "REJECTED":
      return "Your request was rejected."
    default:
      return "Your request was submitted successfully."
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser()
    const { id } = await params

    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        attachments: { orderBy: { createdAt: "asc" } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true, role: true } },
            attachments: { orderBy: { createdAt: "asc" } },
          },
        },
        timelineEvents: {
          orderBy: { createdAt: "asc" },
          include: {
            actor: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    })

    if (!request) {
      return NextResponse.json(
        { success: false, message: "Service request not found." },
        { status: 404 }
      )
    }

    if (!request.adminLastViewed) {
      await prisma.serviceRequest.update({
        where: { id: request.id },
        data: {
          adminLastViewed: new Date(),
          timelineEvents: {
            create: {
              actorId: admin.userId,
              eventType: "REQUEST_VIEWED",
              message: "Admin reviewed request details.",
            },
          },
        },
      })
    }

    return NextResponse.json({ success: true, request })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser()
    const { id } = await params
    const body = await req.json()
    const parsed = schema.parse(body)

    const existing = await prisma.serviceRequest.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        title: true,
        status: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Service request not found." },
        { status: 404 }
      )
    }

    const request = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: parsed.status,
        timelineEvents: {
          create: {
            actorId: admin.userId,
            eventType: "STATUS_CHANGED",
            message: `Status changed to ${parsed.status.replaceAll("_", " ")}.`,
            statusFrom: existing.status,
            statusTo: parsed.status,
          },
        },
      },
      select: { id: true, userId: true, title: true, status: true },
    })

    await createUserNotification(
      request.userId,
      "SERVICE_REQUEST_STATUS",
      "Service request status updated",
      statusUpdateMessage(parsed.status),
      "SERVICE_REQUEST",
      request.id
    )

    await logUserActivity(admin.userId, "ADMIN_SERVICE_REQUEST_STATUS_UPDATED", {
      serviceRequestId: request.id,
      from: existing.status,
      to: parsed.status,
    })

    return NextResponse.json({
      success: true,
      message: "Service request status updated.",
      request,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
