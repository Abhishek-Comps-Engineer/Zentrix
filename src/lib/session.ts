import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { Role } from "@prisma/client"
import { getJwtSecretBytes } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type SessionUser = {
  userId: string
  role: Role
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get("token")?.value
  if (!token) return null

  const secret = getJwtSecretBytes()
  const { payload } = await jwtVerify(token, secret)

  if (!payload.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: String(payload.userId) },
    select: { id: true, role: true, isActive: true },
  })

  if (!user || !user.isActive) return null

  return {
    userId: user.id,
    role: user.role,
  }
}

export async function requireSessionUser() {
  const user = await getSessionUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }
  return user
}

export async function requireAdminUser() {
  const user = await requireSessionUser()
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN")
  }
  return user
}
