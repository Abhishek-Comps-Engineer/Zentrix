import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"

export async function GET(req: Request) {
  try {
    await requireAdminUser()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const q = searchParams.get("q")?.trim()

    const tickets = await prisma.supportTicket.findMany({
      where: {
        AND: [
          status && ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)
            ? { status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" }
            : {},
          q
            ? {
                OR: [
                  { subject: { contains: q, mode: "insensitive" } },
                  { message: { contains: q, mode: "insensitive" } },
                  { user: { email: { contains: q, mode: "insensitive" } } },
                ],
              }
            : {},
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        replies: {
          include: {
            sender: { select: { id: true, name: true, role: true } },
          },
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
