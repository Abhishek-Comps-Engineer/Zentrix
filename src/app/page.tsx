"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Code, Smartphone, BrainCircuit, Rocket } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-b from-background to-secondary/20">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
              Future of Software Development
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl">
              Transforming Ideas into <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Digital Execution
              </span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Zentrix delivers production-ready software solutions. From scalable web
              apps to AI integrations and enterprise mobility.
            </p>
            <div className="space-x-4">
              <Button size="lg" className="h-12 px-8" asChild>
                <Link href="/request-service">
                  Start a Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                <Link href="/portfolio">View Portfolio</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="w-full py-20 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">Our Core Services</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Bringing technical excellence to every layer of your business stack.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 mt-12">
            {[
              { title: "Web Application Development", icon: Code, desc: "Scalable Next.js and React enterprise applications." },
              { title: "Mobile Development", icon: Smartphone, desc: "Native-like iOS and Android apps with React Native." },
              { title: "AI & ML Solutions", icon: BrainCircuit, desc: "Intelligent automation and LLM integrations." },
              { title: "SaaS Platforms", icon: Rocket, desc: "End-to-end multi-tenant product development." },
            ].map((srv, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow bg-secondary/10">
                  <CardHeader>
                    <srv.icon className="h-10 w-10 text-blue-500 mb-4" />
                    <CardTitle>{srv.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{srv.desc}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
            Ready to build something amazing?
          </h2>
          <p className="max-w-[600px] mx-auto text-primary-foreground/80 md:text-lg mb-8">
            Join the companies transforming their industries with Zentrix.
          </p>
          <Button size="lg" variant="secondary" className="h-12 px-8" asChild>
            <Link href="/contact">Contact Our Experts</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
