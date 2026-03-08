"use client"

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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { MapPin, Mail, Phone } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
    message: z.string().min(10, { message: "Message must be at least 10 characters." }),
})

export default function ContactPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        // API call placeholder
        console.log(values)
        toast("Message Sent!", {
            description: "We've received your message and will get back to you shortly.",
        })
        form.reset()
    }

    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Contact Us</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Get in touch with our team to discuss your next big project.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                        <div className="space-y-4 text-muted-foreground">
                            <div className="flex items-center space-x-4">
                                <MapPin className="text-primary h-6 w-6" />
                                <span>123 Innovation Drive, Tech City, TX 75001</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Mail className="text-primary h-6 w-6" />
                                <span>hello@zentrix.dev</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Phone className="text-primary h-6 w-6" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-64 bg-muted rounded-xl border flex items-center justify-center text-muted-foreground">
                        [Google Maps Placeholder]
                    </div>
                </div>

                <div className="bg-card p-8 rounded-xl border shadow-sm">
                    <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="john@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Project Inquiry" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us about your project..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">Send Message</Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
