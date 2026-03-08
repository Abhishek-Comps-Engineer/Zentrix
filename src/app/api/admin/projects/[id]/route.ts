import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"
import { slugify } from "@/lib/slug"
import { logUserActivity } from "@/lib/activity"

const mediaSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]),
  url: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().nonnegative().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
})

const updateProjectSchema = z.object({
  title: z.string().min(3).optional(),
  category: z.enum(["WEB", "MOBILE", "AI", "SAAS"]).optional(),
  shortDescription: z.string().min(10).optional(),
  detailedDescription: z.string().min(30).optional(),
  technologies: z.array(z.string().min(1)).min(1).optional(),
  coverImageUrl: z.string().nullable().optional(),
  demoVideoUrl: z.string().nullable().optional(),
  clientName: z.string().nullable().optional(),
  completionDate: z.string().datetime().nullable().optional(),
  liveLink: z.string().url().nullable().optional(),
  repositoryLink: z.string().url().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  media: z.array(mediaSchema).optional(),
})

async function ensureUniqueSlug(title: string, projectId: string) {
  const base = slugify(title) || `project-${Date.now()}`
  let slug = base
  let attempt = 1

  while (
    await prisma.project.findFirst({
      where: { slug, NOT: { id: projectId } },
      select: { id: true },
    })
  ) {
    attempt += 1
    slug = `${base}-${attempt}`
  }
  return slug
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser()
    const { id } = await params
    const body = await req.json()
    const parsed = updateProjectSchema.parse(body)

    const existing = await prisma.project.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      )
    }

    const slug = parsed.title
      ? await ensureUniqueSlug(parsed.title, id)
      : existing.slug

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: parsed.title ?? existing.title,
        slug,
        category: parsed.category ?? existing.category,
        shortDescription: parsed.shortDescription ?? existing.shortDescription,
        detailedDescription:
          parsed.detailedDescription ?? existing.detailedDescription,
        technologies: parsed.technologies ?? existing.technologies,
        coverImageUrl:
          parsed.coverImageUrl !== undefined
            ? parsed.coverImageUrl
            : existing.coverImageUrl,
        demoVideoUrl:
          parsed.demoVideoUrl !== undefined
            ? parsed.demoVideoUrl
            : existing.demoVideoUrl,
        clientName:
          parsed.clientName !== undefined
            ? parsed.clientName
            : existing.clientName,
        completionDate:
          parsed.completionDate !== undefined
            ? parsed.completionDate
              ? new Date(parsed.completionDate)
              : null
            : existing.completionDate,
        liveLink:
          parsed.liveLink !== undefined ? parsed.liveLink : existing.liveLink,
        repositoryLink:
          parsed.repositoryLink !== undefined
            ? parsed.repositoryLink
            : existing.repositoryLink,
        status: parsed.status ?? existing.status,
        media:
          parsed.media !== undefined
            ? {
                deleteMany: {},
                create: parsed.media.map((item, index) => ({
                  type: item.type,
                  url: item.url,
                  fileName: item.fileName,
                  fileSize: item.fileSize ?? null,
                  sortOrder: item.sortOrder ?? index,
                })),
              }
            : undefined,
      },
      include: { media: { orderBy: { sortOrder: "asc" } } },
    })

    await logUserActivity(admin.userId, "ADMIN_PROJECT_UPDATED", {
      projectId: id,
    })

    return NextResponse.json({
      success: true,
      message: "Project updated successfully.",
      project,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser()
    const { id } = await params

    await prisma.project.delete({ where: { id } })
    await logUserActivity(admin.userId, "ADMIN_PROJECT_DELETED", { projectId: id })

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully.",
    })
  } catch (error) {
    return handleApiError(error)
  }
}
