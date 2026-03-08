import { prisma } from "@/lib/prisma"
import type { NotificationType } from "@prisma/client"

export async function createAdminNotification(
  type: NotificationType,
  title: string,
  message: string,
  entityType?: string,
  entityId?: string
) {
  return prisma.notification.create({
    data: {
      type,
      title,
      message,
      forAdmin: true,
      entityType,
      entityId,
    },
  })
}

export async function createUserNotification(
  recipientId: string,
  type: NotificationType,
  title: string,
  message: string,
  entityType?: string,
  entityId?: string
) {
  return prisma.notification.create({
    data: {
      type,
      title,
      message,
      recipientId,
      forAdmin: false,
      entityType,
      entityId,
    },
  })
}
