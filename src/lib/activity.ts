import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function logUserActivity(
  userId: string,
  action: string,
  metadata?: Prisma.InputJsonObject
) {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        action,
        metadata: metadata ?? undefined,
      },
    })
  } catch {
    // Activity logging should not break primary workflows.
  }
}
