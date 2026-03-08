import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"

const MAX_IMAGE_SIZE_MB = 8
const MAX_VIDEO_SIZE_MB = 40
const MAX_DOC_SIZE_MB = 12

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm"])
const ALLOWED_DOC_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
])

function getUploadDirectory() {
  return path.join(process.cwd(), "public", "uploads")
}

function getMaxSizeBytes(type: string) {
  if (ALLOWED_IMAGE_TYPES.has(type)) return MAX_IMAGE_SIZE_MB * 1024 * 1024
  if (ALLOWED_VIDEO_TYPES.has(type)) return MAX_VIDEO_SIZE_MB * 1024 * 1024
  if (ALLOWED_DOC_TYPES.has(type)) return MAX_DOC_SIZE_MB * 1024 * 1024
  return 0
}

function getSafeExtension(mimeType: string) {
  const extensionMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  }

  return extensionMap[mimeType] || ""
}

export function getMediaType(mimeType: string) {
  if (ALLOWED_IMAGE_TYPES.has(mimeType)) return "IMAGE" as const
  if (ALLOWED_VIDEO_TYPES.has(mimeType)) return "VIDEO" as const
  if (ALLOWED_DOC_TYPES.has(mimeType)) return "DOCUMENT" as const
  throw new Error("Unsupported file type. Allowed: images, mp4/webm videos, and PDF/Word docs.")
}

export async function saveUploadFile(file: File) {
  const mediaType = getMediaType(file.type)
  const maxSize = getMaxSizeBytes(file.type)

  if (file.size > maxSize) {
    throw new Error(`File is too large for ${mediaType.toLowerCase()} upload.`)
  }

  const extension = getSafeExtension(file.type) || path.extname(file.name) || ""
  const generatedName = `${Date.now()}-${crypto.randomUUID()}${extension}`
  const uploadDir = getUploadDirectory()
  const absoluteTarget = path.join(uploadDir, generatedName)

  await fs.mkdir(uploadDir, { recursive: true })
  const fileBuffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(absoluteTarget, fileBuffer)

  return {
    type: mediaType,
    mediaType,
    url: `/uploads/${generatedName}`,
    fileName: file.name,
    fileSize: file.size,
  }
}
