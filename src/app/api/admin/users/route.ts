import { NextResponse } from "next/server"
import { Prisma, Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"

export async function GET(req: Request) {
  try {
    await requireAdminUser()

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")?.trim()
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const page = Math.max(1, Number(searchParams.get("page") || 1))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 10)))
    const skip = (page - 1) * limit

    const andFilters: Prisma.UserWhereInput[] = []

    if (query) {
      andFilters.push({
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      })
    }

    if (role === "USER" || role === "ADMIN") {
      andFilters.push({ role: role as Role })
    }

    if (status === "active") {
      andFilters.push({ isActive: true })
    } else if (status === "inactive") {
      andFilters.push({ isActive: false })
    }

    const where: Prisma.UserWhereInput =
      andFilters.length > 0 ? { AND: andFilters } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          activities: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { action: true, createdAt: true },
          },
          _count: {
            select: {
              serviceRequests: true,
              supportTickets: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
