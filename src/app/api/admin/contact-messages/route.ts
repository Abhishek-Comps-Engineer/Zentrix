import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"

export async function GET(req: Request) {
  try {
    await requireAdminUser()
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.trim()

    const messages = await prisma.contactMessage.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { message: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    return NextResponse.json({ success: true, messages })
  } catch (error) {
    return handleApiError(error)
  }
}
