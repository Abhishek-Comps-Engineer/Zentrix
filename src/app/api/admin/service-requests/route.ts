import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"
import { serviceRequestCategories, serviceRequestPriorities, serviceRequestStatuses } from "@/lib/service-requests"

const allowedStatuses = [...serviceRequestStatuses, "PENDING", "IN_REVIEW", "APPROVED"] as const

export async function GET(req: Request) {
  try {
    await requireAdminUser()
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.trim()
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const page = Math.max(1, Number(searchParams.get("page") || 1))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)))
    const skip = (page - 1) * limit

    const and: Prisma.ServiceRequestWhereInput[] = []
    if (q) {
      and.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { details: { contains: q, mode: "insensitive" } },
          { user: { email: { contains: q, mode: "insensitive" } } },
          { user: { name: { contains: q, mode: "insensitive" } } },
        ],
      })
    }
    if (status && allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
      and.push({ status: status as (typeof allowedStatuses)[number] })
    }
    if (category && serviceRequestCategories.includes(category as (typeof serviceRequestCategories)[number])) {
      and.push({ category: category as (typeof serviceRequestCategories)[number] })
    }
    if (priority && serviceRequestPriorities.includes(priority as (typeof serviceRequestPriorities)[number])) {
      and.push({ priority: priority as (typeof serviceRequestPriorities)[number] })
    }

    const where: Prisma.ServiceRequestWhereInput = and.length ? { AND: and } : {}

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          priority: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { messages: true, attachments: true, timelineEvents: true },
          },
        },
      }),
      prisma.serviceRequest.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      requests,
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

