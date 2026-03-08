"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { requestCategoryLabel, requestPriorityLabel, requestStatusLabel } from "@/lib/service-requests"

type RequestDetails = {
  id: string
  title: string
  details: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  attachments: {
    id: string
    type: "IMAGE" | "VIDEO" | "DOCUMENT"
    url: string
    fileName: string
    createdAt: string
  }[]
  messages: {
    id: string
    message: string
    createdAt: string
    sender: { id: string; name: string; role: "USER" | "ADMIN" }
    attachments: {
      id: string
      type: "IMAGE" | "VIDEO" | "DOCUMENT"
      url: string
      fileName: string
    }[]
  }[]
  timelineEvents: {
    id: string
    eventType: string
    message: string
    createdAt: string
    actor: { id: string; name: string; role: "USER" | "ADMIN" } | null
  }[]
}

type UploadedFile = {
  type: "IMAGE" | "VIDEO" | "DOCUMENT"
  url: string
  fileName: string
  fileSize?: number
}

export default function RequestDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [request, setRequest] = useState<RequestDetails | null>(null)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [attachments, setAttachments] = useState<UploadedFile[]>([])

  const requestId = params?.id

  const loadRequest = useCallback(async () => {
    if (!requestId) return
    const res = await fetch(`/api/services/${requestId}`, { cache: "no-store" })
    const data = await res.json()

    if (!res.ok) {
      if (res.status === 401) {
        router.push(`/login?callbackUrl=/dashboard/requests/${requestId}`)
        return
      }
      toast("Error", { description: data.message || "Failed to load request." })
      return
    }
    setRequest(data.request || null)
  }, [requestId, router])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        await loadRequest()
      } catch {
        if (!cancelled) {
          toast("Error", { description: "Failed to load request details." })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [loadRequest])

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append("files", file))

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/services/uploads")
      xhr.withCredentials = true
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100))
        }
      }
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText || "{}")
          if (xhr.status >= 200 && xhr.status < 300) {
            setAttachments((prev) => [...prev, ...(data.files || [])])
          } else {
            toast("Upload failed", { description: data.message || "Could not upload attachments." })
          }
        } catch {
          toast("Upload failed", { description: "Unexpected upload response." })
        } finally {
          setUploading(false)
          setUploadProgress(0)
          resolve()
        }
      }
      xhr.onerror = () => {
        toast("Upload failed", { description: "Network error during upload." })
        setUploading(false)
        setUploadProgress(0)
        resolve()
      }
      xhr.send(formData)
    })
  }

  async function sendReply() {
    if (!requestId || !reply.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/services/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: reply.trim(),
          attachments,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast("Reply failed", { description: data.message || "Could not send reply." })
        return
      }

      setReply("")
      setAttachments([])
      toast("Reply sent", { description: "Your response was added to the request thread." })
      await loadRequest()
    } catch {
      toast("Reply failed", { description: "Network error while sending reply." })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading request details...</div>
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Request not found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{request.title}</CardTitle>
          <CardDescription>
            Request ID: {request.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{requestStatusLabel(request.status)}</Badge>
            <Badge variant="outline">{requestCategoryLabel(request.category)}</Badge>
            <Badge variant="outline">{requestPriorityLabel(request.priority)}</Badge>
          </div>
          <p className="text-muted-foreground">{request.details}</p>
          <p className="text-xs text-muted-foreground">
            Created: {new Date(request.createdAt).toLocaleString()} | Updated: {new Date(request.updatedAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {request.attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No request attachments uploaded.</p>
            ) : (
              request.attachments.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded border p-2 text-sm hover:bg-muted/50"
                >
                  {file.fileName}
                </a>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {request.timelineEvents.map((event) => (
              <div key={event.id} className="rounded border p-2 text-sm">
                <p className="font-medium">{event.message}</p>
                <p className="text-xs text-muted-foreground">
                  {event.actor?.name || "System"} | {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {request.messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            request.messages.map((entry) => (
              <div key={entry.id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{entry.sender.name} ({entry.sender.role})</p>
                  <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
                <p className="text-sm mt-1">{entry.message}</p>
                {entry.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {entry.attachments.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-primary underline"
                      >
                        {file.fileName}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          <div className="space-y-2">
            <Textarea
              placeholder="Write your reply..."
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              className="min-h-28"
            />

            <div
              className="rounded-md border-2 border-dashed p-3 text-sm text-muted-foreground"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                uploadFiles(event.dataTransfer.files)
              }}
            >
              <p className="mb-2 font-medium text-foreground">Attach files (optional)</p>
              <Input type="file" multiple onChange={(event) => uploadFiles(event.target.files)} />
            </div>

            {uploading && <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>}
            {attachments.map((file, index) => (
              <div key={`${file.url}-${index}`} className="rounded border p-2 flex justify-between text-sm">
                <span>{file.fileName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={sendReply} disabled={sending || uploading || !reply.trim()}>
              {sending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

