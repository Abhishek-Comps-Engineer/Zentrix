import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"
import { createAdminNotification } from "@/lib/notifications"
import { sendAdminEmail, canSendEmail, getEmailConfigIssues } from "@/lib/mailer"
import { logUserActivity } from "@/lib/activity"
import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit"

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z
    .string()
    .min(7)
    .max(20)
    .regex(/^[0-9+()\-\s]+$/, "Phone number format is invalid."),
  message: z.string().min(10).max(2000),
  website: z.string().max(0).optional(),
})

export async function POST(req: Request) {
  try {
    const rateLimit = consumeRateLimit(
      `contact:${getRequestIp(req)}`,
      6,
      10 * 60 * 1000
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many contact submissions. Try again in ${rateLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      )
    }

    const body = await req.json()
    const parsed = contactSchema.parse(body)
    const normalized = {
      name: parsed.name.trim(),
      email: parsed.email.trim().toLowerCase(),
      phone: parsed.phone.trim(),
      message: parsed.message.trim(),
    }
    const sessionUser = await getSessionUser()

    const duplicate = await prisma.contactMessage.findFirst({
      where: {
        email: normalized.email,
        message: normalized.message,
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
          message:
            "Duplicate message detected. Please wait a moment before sending again.",
        },
        { status: 429 }
      )
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name: parsed.name,
        email: normalized.email,
        phone: normalized.phone,
        message: normalized.message,
        userId: sessionUser?.userId,
      },
    })

    await createAdminNotification(
      "CONTACT_MESSAGE",
      "New contact message",
      `${normalized.name} sent a contact message.`,
      "CONTACT_MESSAGE",
      contact.id
    )

    if (sessionUser) {
      await logUserActivity(sessionUser.userId, "CONTACT_MESSAGE_SENT", {
        contactMessageId: contact.id,
      })
    }

    if (!canSendEmail()) {
      return NextResponse.json(
        {
          success: false,
          message: "Message saved, but email delivery is not configured. Please contact support directly.",
          details: process.env.NODE_ENV === "development" ? getEmailConfigIssues() : undefined,
        },
        { status: 503 }
      )
    }

    try {
      const timestamp = new Date().toISOString()
      await sendAdminEmail(
        `New contact message from ${normalized.name}`,
        `Name: ${normalized.name}\nEmail: ${normalized.email}\nPhone: ${normalized.phone}\nTimestamp: ${timestamp}\n\n${normalized.message}`
      )
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Message saved, but email delivery failed. Admin has been notified in dashboard.",
        },
        { status: 502 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully.",
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
