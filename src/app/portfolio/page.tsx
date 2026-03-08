"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const categories = ["All", "Web", "Mobile", "AI", "SaaS"]

// Placeholder data since API / DB is not wired up yet
const initialProjects = [
    { id: "1", title: "FinTech Dashboard", category: "Web", desc: "A modern analytics dashboard for financial data.", tech: ["Next.js", "Tailwind", "Prisma"] },
    { id: "2", title: "HealthAI Diagnostics", category: "AI", desc: "Computer vision symptom analysis app.", tech: ["Python", "TensorFlow", "React Native"] },
    { id: "3", title: "E-Commerce Mobile", category: "Mobile", desc: "Native iOS & Android storefront.", tech: ["Flutter", "Node.js"] },
    { id: "4", title: "SaaS CRM Panel", category: "SaaS", desc: "Multi-tenant CRM platform.", tech: ["React", "Express", "PostgreSQL"] },
]

export default function PortfolioPage() {
    const [activeCategory, setActiveCategory] = useState("All")

    const filtered = activeCategory === "All"
        ? initialProjects
        : initialProjects.filter(p => p.category === activeCategory)

    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Our Portfolio</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Explore our recent successful deliveries across various industries.
                </p>
            </div>

            <div className="flex justify-center space-x-2 mb-12 flex-wrap gap-y-2">
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={activeCategory === cat ? "default" : "outline"}
                        onClick={() => setActiveCategory(cat)}
                        className="rounded-full"
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filtered.map((proj, idx) => (
                    <motion.div
                        key={proj.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="h-full flex flex-col hover:shadow-xl transition-shadow overflow-hidden border-border/50 bg-secondary/10">
                            <div className="h-48 bg-muted w-full animate-pulse flex items-center justify-center text-muted-foreground">
                                [Image Placeholder]
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="secondary">{proj.category}</Badge>
                                </div>
                                <CardTitle>{proj.title}</CardTitle>
                                <CardDescription>{proj.desc}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between">
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {proj.tech.map(t => (
                                        <span key={t} className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href={`/portfolio/${proj.id}`}>View Details</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    No projects found for this category.
                </div>
            )}
        </div>
    )
}
