import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-errors"
import { requireSessionUser } from "@/lib/session"
import { saveUploadFile } from "@/lib/upload"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    await requireSessionUser()

    const formData = await req.formData()
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File)

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please attach at least one file." },
        { status: 400 }
      )
    }

    if (files.length > 10) {
      return NextResponse.json(
        { success: false, message: "Maximum 10 files can be uploaded at once." },
        { status: 400 }
      )
    }

    const uploads = await Promise.all(files.map((file) => saveUploadFile(file)))

    return NextResponse.json({
      success: true,
      files: uploads.map((file) => ({
        type: file.type,
        url: file.url,
        fileName: file.fileName,
        fileSize: file.fileSize,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

