import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/api-errors"
import { requireSessionUser } from "@/lib/session"
import {
  createAdminNotification,
  createUserNotification,
} from "@/lib/notifications"
import { logUserActivity } from "@/lib/activity"

const replySchema = z.object({
  message: z.string().min(1).max(2000),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser()
    const { id } = await params
    const body = await req.json()
    const parsed = replySchema.parse(body)

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, userId: true, subject: true },
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Support ticket not found." },
        { status: 404 }
      )
    }

    const isAdmin = session.role === "ADMIN"
    const isOwner = session.userId === ticket.userId

    if (!isAdmin && !isOwner) {
      throw new Error("FORBIDDEN")
    }

    const reply = await prisma.supportReply.create({
      data: {
        ticketId: id,
        senderId: session.userId,
        message: parsed.message,
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    })

    await prisma.supportTicket.update({
      where: { id },
      data: {
        status: isAdmin ? "IN_PROGRESS" : undefined,
      },
    })

    if (isAdmin) {
      await createUserNotification(
        ticket.userId,
        "SUPPORT_REPLY",
        "Support replied",
        `Admin replied on: ${ticket.subject}`,
        "SUPPORT_TICKET",
        ticket.id
      )
    } else {
      await createAdminNotification(
        "SUPPORT_REQUEST",
        "Support ticket update",
        `User replied on: ${ticket.subject}`,
        "SUPPORT_TICKET",
        ticket.id
      )
    }

    await logUserActivity(session.userId, "SUPPORT_REPLY_SENT", {
      ticketId: ticket.id,
      asAdmin: isAdmin,
    })

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully.",
      reply,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
