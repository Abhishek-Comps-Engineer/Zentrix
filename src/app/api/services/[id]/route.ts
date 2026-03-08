import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/api-errors"
import { requireSessionUser } from "@/lib/session"
import { logUserActivity } from "@/lib/activity"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser()
    const { id } = await params

    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        attachments: {
          orderBy: { createdAt: "asc" },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true, role: true } },
            attachments: {
              orderBy: { createdAt: "asc" },
            },
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

    const isAdmin = session.role === "ADMIN"
    const isOwner = request.userId === session.userId
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      )
    }

    if (isAdmin && !request.adminLastViewed) {
      await prisma.serviceRequest.update({
        where: { id: request.id },
        data: {
          adminLastViewed: new Date(),
          timelineEvents: {
            create: {
              actorId: session.userId,
              eventType: "REQUEST_VIEWED",
              message: "Admin reviewed request details.",
            },
          },
        },
      })
    }

    await logUserActivity(session.userId, "SERVICE_REQUEST_VIEWED", {
      serviceRequestId: request.id,
      asAdmin: isAdmin,
    })

    return NextResponse.json({
      success: true,
      request,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

