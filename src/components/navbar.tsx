"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/contact", label: "Contact" },
]

export function Navbar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                        Zentrix
                    </span>
                </Link>
                <div className="hidden md:flex flex-1 items-center justify-center space-x-6 text-sm font-medium">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`transition-colors hover:text-foreground/80 ${pathname === link.href ? "text-foreground" : "text-foreground/60"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
                <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-2">
                        <ModeToggle />
                        <Button variant="outline" asChild>
                            <Link href="/login">Client Panel</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/request-service">Request Service</Link>
                        </Button>
                    </div>
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="pr-0">
                            <Link
                                href="/"
                                className="flex items-center"
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="font-bold text-2xl tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                                    Zentrix
                                </span>
                            </Link>
                            <div className="my-8 flex flex-col space-y-4">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`text-lg font-medium transition-colors hover:text-foreground/80 ${pathname === link.href ? "text-foreground" : "text-foreground/60"
                                            }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                            <div className="flex flex-col space-y-4 pr-6">
                                <Button variant="outline" asChild className="w-full justify-start">
                                    <Link href="/login" onClick={() => setIsOpen(false)}>
                                        Client Panel
                                    </Link>
                                </Button>
                                <Button asChild className="w-full justify-start">
                                    <Link href="/request-service" onClick={() => setIsOpen(false)}>
                                        Request Service
                                    </Link>
                                </Button>
                                <div className="pt-2">
                                    <ModeToggle />
                                </div>

                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
