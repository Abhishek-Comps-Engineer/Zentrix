import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireSessionUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"

const patchSchema = z.object({
  action: z.enum(["mark-read", "mark-all-read", "clear-read"]),
  notificationId: z.string().optional(),
})

export async function GET() {
  try {
    const session = await requireSessionUser()

    const notifications = await prisma.notification.findMany({
      where: {
        forAdmin: false,
        OR: [{ recipientId: session.userId }, { recipientId: null }],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json({ success: true, notifications })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSessionUser()
    const body = await req.json()
    const parsed = patchSchema.parse(body)

    if (parsed.action === "mark-read" && parsed.notificationId) {
      await prisma.notification.updateMany({
        where: {
          id: parsed.notificationId,
          recipientId: session.userId,
          forAdmin: false,
        },
        data: { isRead: true },
      })
    } else if (parsed.action === "mark-all-read") {
      await prisma.notification.updateMany({
        where: {
          forAdmin: false,
          recipientId: session.userId,
          isRead: false,
        },
        data: { isRead: true },
      })
    } else if (parsed.action === "clear-read") {
      await prisma.notification.deleteMany({
        where: {
          forAdmin: false,
          recipientId: session.userId,
          isRead: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Notification action completed.",
    })
  } catch (error) {
    return handleApiError(error)
  }
}
