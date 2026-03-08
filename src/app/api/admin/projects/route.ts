import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"
import { slugify } from "@/lib/slug"
import { logUserActivity } from "@/lib/activity"
import { createUserNotification } from "@/lib/notifications"

const mediaSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]),
  url: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().nonnegative().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
})

const projectSchema = z.object({
  title: z.string().min(3),
  category: z.enum(["WEB", "MOBILE", "AI", "SAAS"]),
  shortDescription: z.string().min(10),
  detailedDescription: z.string().min(30),
  technologies: z.array(z.string().min(1)).min(1),
  coverImageUrl: z.string().optional().nullable(),
  demoVideoUrl: z.string().optional().nullable(),
  clientName: z.string().optional().nullable(),
  completionDate: z.string().datetime().optional().nullable(),
  liveLink: z.string().url().optional().nullable(),
  repositoryLink: z.string().url().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  media: z.array(mediaSchema).optional().default([]),
})

async function createUniqueSlug(base: string) {
  const initial = slugify(base)
  const root = initial || `project-${Date.now()}`
  let candidate = root
  let attempt = 1

  // Keep slug collision-safe for concurrent admin usage.
  while (await prisma.project.findUnique({ where: { slug: candidate } })) {
    attempt += 1
    candidate = `${root}-${attempt}`
  }
  return candidate
}

export async function GET(req: Request) {
  try {
    await requireAdminUser()

    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.trim()
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    const where = {
      AND: [
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
        status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)
          ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" }
          : {},
        category && ["WEB", "MOBILE", "AI", "SAAS"].includes(category)
          ? { category: category as "WEB" | "MOBILE" | "AI" | "SAAS" }
          : {},
      ],
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        media: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ success: true, projects })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminUser()
    const body = await req.json()
    const parsed = projectSchema.parse(body)
    const slug = await createUniqueSlug(parsed.title)

    const project = await prisma.project.create({
      data: {
        title: parsed.title,
        slug,
        category: parsed.category,
        shortDescription: parsed.shortDescription,
        detailedDescription: parsed.detailedDescription,
        technologies: parsed.technologies,
        coverImageUrl: parsed.coverImageUrl ?? null,
        demoVideoUrl: parsed.demoVideoUrl ?? null,
        clientName: parsed.clientName ?? null,
        completionDate: parsed.completionDate
          ? new Date(parsed.completionDate)
          : null,
        liveLink: parsed.liveLink ?? null,
        repositoryLink: parsed.repositoryLink ?? null,
        status: parsed.status,
        createdById: admin.userId,
        media: {
          create: parsed.media.map((item, index) => ({
            type: item.type,
            url: item.url,
            fileName: item.fileName,
            fileSize: item.fileSize ?? null,
            sortOrder: item.sortOrder ?? index,
          })),
        },
      },
      include: { media: true },
    })

    await logUserActivity(admin.userId, "ADMIN_PROJECT_CREATED", {
      projectId: project.id,
      title: project.title,
    })

    if (project.status === "PUBLISHED") {
      const users = await prisma.user.findMany({
        where: { role: "USER", isActive: true },
        select: { id: true },
      })
      await Promise.all(
        users.map((user) =>
          createUserNotification(
            user.id,
            "PROJECT_UPDATE",
            "New project published",
            `${project.title} has been published in portfolio.`,
            "PROJECT",
            project.id
          )
        )
      )
    }

    return NextResponse.json(
      { success: true, message: "Project created successfully.", project },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
