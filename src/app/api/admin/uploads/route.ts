import { NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/session"
import { handleApiError } from "@/lib/api-errors"
import { saveUploadFile } from "@/lib/upload"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    await requireAdminUser()

    const formData = await req.formData()
    const fileEntries = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File)

    if (fileEntries.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please attach at least one file." },
        { status: 400 }
      )
    }

    if (fileEntries.length > 10) {
      return NextResponse.json(
        { success: false, message: "Maximum 10 files are allowed per upload request." },
        { status: 400 }
      )
    }

    const uploads = await Promise.all(fileEntries.map((file) => saveUploadFile(file)))

    return NextResponse.json({
      success: true,
      files: uploads,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
