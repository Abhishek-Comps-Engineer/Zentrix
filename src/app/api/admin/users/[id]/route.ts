import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdminUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"
import { logUserActivity } from "@/lib/activity"

const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser()
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            serviceRequests: true,
            supportTickets: true,
            contactMessages: true,
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 25,
          select: {
            id: true,
            action: true,
            metadata: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser()
    const { id } = await params
    const body = await req.json()
    const parsed = updateUserSchema.parse(body)

    if (admin.userId === id && parsed.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot deactivate your own admin account.",
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: parsed,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    })

    await logUserActivity(admin.userId, "ADMIN_USER_UPDATED", { targetUserId: id, ...parsed })

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
      user,
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

    if (admin.userId === id) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own admin account." },
        { status: 400 }
      )
    }

    await prisma.user.delete({ where: { id } })
    await logUserActivity(admin.userId, "ADMIN_USER_DELETED", { targetUserId: id })

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    })
  } catch (error) {
    return handleApiError(error)
  }
}
