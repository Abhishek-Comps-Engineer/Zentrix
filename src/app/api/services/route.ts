import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireSessionUser } from "@/lib/session"
import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit"
import { createAdminNotification } from "@/lib/notifications"
import { handleApiError } from "@/lib/api-errors"
import { logUserActivity } from "@/lib/activity"
import { requestCategoryLabel, serviceRequestCategories, serviceRequestPriorities, serviceRequestStatuses } from "@/lib/service-requests"

const allowedStatuses = [...serviceRequestStatuses, "PENDING", "IN_REVIEW", "APPROVED"] as const

const attachmentSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]),
  url: z.string().startsWith("/uploads/"),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().nonnegative().max(50 * 1024 * 1024).optional(),
})

const createServiceRequestSchema = z.object({
  title: z.string().min(3).max(160),
  category: z.enum(serviceRequestCategories),
  priority: z.enum(serviceRequestPriorities),
  description: z.string().min(20).max(5000),
  budget: z.string().max(80).optional(),
  timeline: z.string().max(120).optional(),
  attachments: z.array(attachmentSchema).max(10).optional().default([]),
})

export async function GET(req: Request) {
  try {
    const session = await requireSessionUser()
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.trim()
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const page = Math.max(1, Number(searchParams.get("page") || 1))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)))
    const skip = (page - 1) * limit

    const and: Prisma.ServiceRequestWhereInput[] = []
    if (session.role !== "ADMIN") {
      and.push({ userId: session.userId })
    }
    if (q) {
      and.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { details: { contains: q, mode: "insensitive" } },
          { serviceType: { contains: q, mode: "insensitive" } },
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
          serviceType: true,
          details: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: {
              attachments: true,
              messages: true,
              timelineEvents: true,
            },
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

export async function POST(req: Request) {
  try {
    const rateLimit = consumeRateLimit(
      `service-request:${getRequestIp(req)}`,
      10,
      10 * 60 * 1000
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many submissions. Try again in ${rateLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      )
    }

    const session = await requireSessionUser()
    const body = await req.json()
    const parsed = createServiceRequestSchema.parse(body)

    const duplicate = await prisma.serviceRequest.findFirst({
      where: {
        userId: session.userId,
        title: parsed.title,
        details: parsed.description,
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
          message: "Duplicate request detected. Please wait before resubmitting.",
        },
        { status: 429 }
      )
    }

    const request = await prisma.serviceRequest.create({
      data: {
        userId: session.userId,
        title: parsed.title,
        category: parsed.category,
        priority: parsed.priority,
        serviceType: requestCategoryLabel(parsed.category),
        details: parsed.description,
        budget: parsed.budget || null,
        timeline: parsed.timeline || null,
        fileUrl: parsed.attachments[0]?.url || null,
        status: "SUBMITTED",
        attachments: {
          create: parsed.attachments.map((file) => ({
            uploaderId: session.userId,
            type: file.type,
            url: file.url,
            fileName: file.fileName,
            fileSize: file.fileSize ?? null,
          })),
        },
        timelineEvents: {
          create: {
            actorId: session.userId,
            eventType: "REQUEST_SUBMITTED",
            message: "Request submitted.",
            statusTo: "SUBMITTED",
          },
        },
      },
      select: {
        id: true,
        title: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
      },
    })

    const creator = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true },
    })

    await createAdminNotification(
      "SERVICE_REQUEST_CREATED",
      "New service request",
      `${creator?.name || "A user"} submitted "${request.title}".`,
      "SERVICE_REQUEST",
      request.id
    )

    await logUserActivity(session.userId, "SERVICE_REQUEST_CREATED", {
      serviceRequestId: request.id,
      category: request.category,
      priority: request.priority,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Service request submitted successfully.",
        request,
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}

