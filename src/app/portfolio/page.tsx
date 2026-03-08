"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { MediaImage } from "@/components/media/media-image"

type PortfolioProject = {
  id: string
  slug: string
  title: string
  category: "WEB" | "MOBILE" | "AI" | "SAAS"
  shortDescription: string
  technologies: string[]
  coverImageUrl: string | null
  media: { url: string }[]
}

const categories = [
  { label: "All", value: "ALL" },
  { label: "Web Development", value: "WEB" },
  { label: "Mobile Development", value: "MOBILE" },
  { label: "AI Solutions", value: "AI" },
  { label: "SaaS Platforms", value: "SAAS" },
] as const

function categoryLabel(category: PortfolioProject["category"]) {
  if (category === "WEB") return "Web Development"
  if (category === "MOBILE") return "Mobile Development"
  if (category === "AI") return "AI Solutions"
  return "SaaS Platforms"
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]["value"]>("ALL")

  useEffect(() => {
    let mounted = true

    async function loadProjects() {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" })
        const data = await res.json()

        if (!res.ok) {
          toast("Error", { description: data.message || "Failed to load portfolio." })
          return
        }

        if (mounted) {
          setProjects(data.projects || [])
        }
      } catch {
        toast("Error", { description: "Network error while loading portfolio." })
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProjects()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (activeCategory === "ALL") return projects
    return projects.filter((project) => project.category === activeCategory)
  }, [activeCategory, projects])

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Our Portfolio</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore verified deliveries across web, mobile, AI, and SaaS.
        </p>
      </div>

      <div className="flex justify-center space-x-2 mb-12 flex-wrap gap-y-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={activeCategory === category.value ? "default" : "outline"}
            onClick={() => setActiveCategory(category.value)}
            className="rounded-full"
          >
            {category.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <Skeleton className="h-52 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((project) => {
            const hero = project.coverImageUrl || project.media[0]?.url || null
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="h-full flex flex-col overflow-hidden border-border/50 hover:shadow-lg transition-shadow">
                  <MediaImage
                    src={hero || "/images/project-fallback.svg"}
                    alt={`${project.title} cover`}
                    wrapperClassName="h-52 w-full"
                  />
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{categoryLabel(project.category)}</Badge>
                    </div>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.shortDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/portfolio/${project.slug}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No projects found in this category.
        </div>
      )}
    </div>
  )
}
