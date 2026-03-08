"use client"

import { motion } from "framer-motion"
import { Briefcase, Users, Trophy, Target } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 space-y-24">
            {/* Mission Section */}
            <section className="text-center space-y-6 max-w-3xl mx-auto">
                <motion.h1
                    className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    About Zentrix
                </motion.h1>
                <motion.p
                    className="text-xl text-muted-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    We are a team of passionate engineers, designers, and innovators dedicated to building software that drives growth. Our mission is to transform complex challenges into elegant, scalable digital solutions.
                </motion.p>
            </section>

            {/* Stats Counter */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y">
                {[
                    { icon: Users, label: "Happy Clients", value: "150+" },
                    { icon: Briefcase, label: "Projects Delivered", value: "300+" },
                    { icon: Trophy, label: "Awards Won", value: "15" },
                    { icon: Target, label: "Years Experience", value: "10+" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        className="flex flex-col items-center justify-center space-y-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <stat.icon className="h-8 w-8 text-blue-500 mb-2" />
                        <h3 className="text-3xl font-bold">{stat.value}</h3>
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                ))}
            </section>

            {/* Experience Timeline placeholder */}
            <section className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {[
                        { year: "2014", title: "Zentrix Founded", desc: "Started as a small web agency." },
                        { year: "2018", title: "Enterprise Expansion", desc: "Landed our first Fortune 500 client." },
                        { year: "2021", title: "AI & ML Division", desc: "Launched dedicated AI solutions integration team." },
                        { year: "2024", title: "Global Reach", desc: "Now operating with teams across 4 continents." },
                    ].map((item, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-primary bg-background text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border shadow-sm bg-card hover:shadow-md transition">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-foreground">{item.title}</div>
                                    <time className="font-caveat font-medium text-blue-500">{item.year}</time>
                                </div>
                                <div className="text-sm text-muted-foreground">{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
