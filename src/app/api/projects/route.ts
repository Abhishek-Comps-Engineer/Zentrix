import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/api-errors"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const q = searchParams.get("q")?.trim()

    const where = {
      AND: [
        { status: "PUBLISHED" as const },
        category && ["WEB", "MOBILE", "AI", "SAAS"].includes(category)
          ? { category: category as "WEB" | "MOBILE" | "AI" | "SAAS" }
          : {},
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" as const } },
                {
                  shortDescription: {
                    contains: q,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {},
      ],
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        media: {
          where: { type: "IMAGE" },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      orderBy: { completionDate: "desc" },
    })

    return NextResponse.json({ success: true, projects })
  } catch (error) {
    return handleApiError(error)
  }
}
