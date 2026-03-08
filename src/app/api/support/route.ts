import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/api-errors"
import { requireSessionUser } from "@/lib/session"
import { createAdminNotification } from "@/lib/notifications"
import { logUserActivity } from "@/lib/activity"
import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit"

const supportSchema = z.object({
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(3000),
})

export async function GET() {
  try {
    const session = await requireSessionUser()

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.userId },
      include: {
        replies: {
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ success: true, tickets })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request) {
  try {
    const rateLimit = consumeRateLimit(
      `support:${getRequestIp(req)}`,
      8,
      10 * 60 * 1000
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many support requests. Try again in ${rateLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      )
    }

    const session = await requireSessionUser()
    const body = await req.json()
    const parsed = supportSchema.parse(body)

    const duplicate = await prisma.supportTicket.findFirst({
      where: {
        userId: session.userId,
        subject: parsed.subject,
        message: parsed.message,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000),
        },
      },
      select: { id: true },
    })

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate support request detected. Please wait and try again.",
        },
        { status: 429 }
      )
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.userId,
        subject: parsed.subject,
        message: parsed.message,
      },
    })

    await createAdminNotification(
      "SUPPORT_REQUEST",
      "New support request",
      `Support request created: ${parsed.subject}`,
      "SUPPORT_TICKET",
      ticket.id
    )

    await logUserActivity(session.userId, "SUPPORT_TICKET_CREATED", {
      ticketId: ticket.id,
    })

    return NextResponse.json(
      { success: true, message: "Support request submitted.", ticket },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
