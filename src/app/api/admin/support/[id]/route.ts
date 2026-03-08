import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"
import { createUserNotification } from "@/lib/notifications"

const schema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser()
    const { id } = await params
    const body = await req.json()
    const parsed = schema.parse(body)

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status: parsed.status },
      select: {
        id: true,
        subject: true,
        status: true,
        userId: true,
      },
    })

    await createUserNotification(
      ticket.userId,
      "SUPPORT_REPLY",
      "Support ticket status updated",
      `Your ticket "${ticket.subject}" is now ${ticket.status.replace("_", " ")}.`,
      "SUPPORT_TICKET",
      ticket.id
    )

    return NextResponse.json({
      success: true,
      message: "Support ticket status updated.",
      ticket,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
