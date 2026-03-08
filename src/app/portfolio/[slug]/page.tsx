import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { MediaImage } from "@/components/media/media-image"
import { MediaVideo } from "@/components/media/media-video"

type ProjectDetail = {
  id: string
  title: string
  category: "WEB" | "MOBILE" | "AI" | "SAAS"
  shortDescription: string
  detailedDescription: string
  technologies: string[]
  coverImageUrl: string | null
  demoVideoUrl: string | null
  clientName: string | null
  completionDate: string | null
  liveLink: string | null
  repositoryLink: string | null
  media: {
    id: string
    type: "IMAGE" | "VIDEO" | "DOCUMENT"
    url: string
    fileName: string
  }[]
}

function categoryLabel(category: ProjectDetail["category"]) {
  if (category === "WEB") return "Web Development"
  if (category === "MOBILE") return "Mobile Development"
  if (category === "AI") return "AI Solutions"
  return "SaaS Platforms"
}

async function getProject(slug: string): Promise<ProjectDetail | null> {
  return prisma.project.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    include: {
      media: {
        select: {
          id: true,
          type: true,
          url: true,
          fileName: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  }) as Promise<ProjectDetail | null>
}

export default async function PortfolioDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) {
    notFound()
  }

  const images = project.media.filter((media) => media.type === "IMAGE")
  const videos = project.media.filter((media) => media.type === "VIDEO")
  const documents = project.media.filter((media) => media.type === "DOCUMENT")

  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">{categoryLabel(project.category)}</Badge>
        <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">{project.shortDescription}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <MediaImage
            src={project.coverImageUrl || images[0]?.url || "/images/project-fallback.svg"}
            alt={`${project.title} cover`}
            wrapperClassName="w-full h-[380px] rounded-xl border"
          />

          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-7">
                {project.detailedDescription}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Image Gallery</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((image) => (
                  <MediaImage
                    key={image.id}
                    src={image.url}
                    alt={image.fileName}
                    wrapperClassName="h-52 rounded-md border"
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {(project.demoVideoUrl || videos.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Project Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.demoVideoUrl && (
                  <MediaVideo src={project.demoVideoUrl} className="w-full rounded-md border" />
                )}
                {videos.map((video) => (
                  <MediaVideo key={video.id} src={video.url} className="w-full rounded-md border" />
                ))}
              </CardContent>
            </Card>
          )}

          {documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {documents.map((document) => (
                  <a
                    key={document.id}
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded border p-3 text-sm hover:bg-muted/50"
                  >
                    {document.fileName}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Client</p>
                <p className="font-medium">{project.clientName || "Confidential"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Completion</p>
                <p className="font-medium">
                  {project.completionDate
                    ? new Date(project.completionDate).toLocaleDateString()
                    : "In progress"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.liveLink && (
                <Button className="w-full" asChild>
                  <Link href={project.liveLink} target="_blank" rel="noopener noreferrer">
                    Live Demo
                  </Link>
                </Button>
              )}
              {project.repositoryLink && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={project.repositoryLink} target="_blank" rel="noopener noreferrer">
                    Repository
                  </Link>
                </Button>
              )}
              {!project.liveLink && !project.repositoryLink && (
                <p className="text-sm text-muted-foreground">No external links available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
