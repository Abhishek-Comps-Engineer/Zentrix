import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const sessionUser = await getSessionUser()
    const canViewUnpublished = sessionUser?.role === "ADMIN"

    const project = await prisma.project.findFirst({
      where: {
        slug,
        ...(canViewUnpublished ? {} : { status: "PUBLISHED" }),
      },
      include: {
        media: {
          orderBy: { sortOrder: "asc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, project })
  } catch (error) {
    return handleApiError(error)
  }
}
