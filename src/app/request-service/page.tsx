"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { requestCategoryLabel, requestPriorityLabel, serviceRequestCategories, serviceRequestPriorities } from "@/lib/service-requests"

type UploadedFile = {
  type: "IMAGE" | "VIDEO" | "DOCUMENT"
  url: string
  fileName: string
  fileSize?: number
}

const formSchema = z.object({
  title: z.string().min(3, "Please enter a request title."),
  category: z.enum(serviceRequestCategories),
  priority: z.enum(serviceRequestPriorities),
  description: z.string().min(20, "Please provide enough request details."),
})

export default function RequestServicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [attachments, setAttachments] = useState<UploadedFile[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "WEBSITE_DEVELOPMENT",
      priority: "MEDIUM",
      description: "",
    },
  })

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
            toast("Upload complete", { description: "Attachment uploaded successfully." })
          } else if (xhr.status === 401) {
            toast("Authentication required", { description: "Please log in to upload files." })
            router.push("/login?callbackUrl=/request-service")
          } else {
            toast("Upload failed", { description: data.message || "Could not upload attachment." })
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          category: values.category,
          priority: values.priority,
          description: values.description,
          attachments,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast("Request submitted", { description: "Your request was created successfully." })
        router.push("/dashboard")
      } else if (res.status === 401) {
        toast("Authentication required", { description: "Please log in to submit a request." })
        router.push("/login?callbackUrl=/request-service")
      } else {
        toast("Request failed", { description: data.message || "Failed to submit request." })
      }
    } catch {
      toast("Request failed", { description: "Something went wrong while submitting request." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter mb-4">New Service Request</h1>
          <p className="text-muted-foreground text-lg">
            Submit a request ticket and track its full lifecycle from review to completion.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Form</CardTitle>
            <CardDescription>
              Provide request details and upload relevant files before submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Example: Need enterprise website revamp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceRequestCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {requestCategoryLabel(category)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceRequestPriorities.map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {requestPriorityLabel(priority)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe goals, expected deliverables, constraints, and timeline context..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div
                  className="rounded-md border-2 border-dashed p-4 text-sm text-muted-foreground"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    uploadFiles(event.dataTransfer.files)
                  }}
                >
                  <p className="mb-2 font-medium text-foreground">Attachments (optional)</p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Drag and drop images, documents, screenshots, or videos.
                  </p>
                  <Input type="file" multiple onChange={(e) => uploadFiles(e.target.files)} />
                </div>

                {uploading && (
                  <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                )}

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={`${file.url}-${index}`} className="rounded border p-2 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{file.fileName}</p>
                          <p className="text-xs text-muted-foreground">{file.type}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={loading || uploading}>
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

