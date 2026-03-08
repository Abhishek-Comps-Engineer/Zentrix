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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const formSchema = z.object({
    serviceType: z.string().min(1, "Please select a service type"),
    details: z.string().min(20, "Please provide more details (min 20 chars)"),
    budget: z.string().optional(),
    timeline: z.string().optional(),
})

export default function RequestServicePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            serviceType: "",
            details: "",
            budget: "",
            timeline: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const res = await fetch("/api/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            const data = await res.json()

            if (res.ok) {
                toast("Request Submitted", { description: "We will review your request shortly." })
                router.push("/dashboard")
            } else if (res.status === 401) {
                toast("Authentication Required", { description: "Please log in to submit a request." })
                router.push("/login?callbackUrl=/request-service")
            } else {
                toast("Error", { description: data.message || "Failed to submit request" })
            }
        } catch (error) {
            toast("Error", { description: "Something went wrong" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tighter mb-4">Start a Project</h1>
                    <p className="text-muted-foreground text-lg">
                        Tell us about your project requirements and we'll get back to you with a proposal.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                        <CardDescription>Fill out the form below securely.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="serviceType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Service Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a service" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="WEB_DEV">Web Application Development</SelectItem>
                                                    <SelectItem value="MOBILE_APP">Mobile App Development</SelectItem>
                                                    <SelectItem value="AI_ML">AI / ML Solutions</SelectItem>
                                                    <SelectItem value="SAAS">SaaS Platform Development</SelectItem>
                                                    <SelectItem value="UI_UX">UI/UX Design Services</SelectItem>
                                                    <SelectItem value="OTHER">Other / Integration</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="details"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Please describe your core features, target audience, and business goals..."
                                                    className="min-h-[150px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="budget"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estimated Budget Range</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select budget" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="<5k">Under $5k</SelectItem>
                                                        <SelectItem value="5k-15k">$5k - $15k</SelectItem>
                                                        <SelectItem value="15k-50k">$15k - $50k</SelectItem>
                                                        <SelectItem value="50k+">$50k+</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="timeline"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Expected Timeline</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select timeline" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="ASAP">ASAP (&lt;1 month)</SelectItem>
                                                        <SelectItem value="1-3_months">1 to 3 months</SelectItem>
                                                        <SelectItem value="3-6_months">3 to 6 months</SelectItem>
                                                        <SelectItem value="Flexible">Flexible</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* File Upload Placeholder */}
                                <div className="space-y-2">
                                    <FormLabel>Attachments (Optional)</FormLabel>
                                    <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground flex flex-col items-center justify-center">
                                        <p className="text-sm">Drag & drop files here, or click to select files</p>
                                        <p className="text-xs mt-1">(File upload functionality is a placeholder)</p>
                                    </div>
                                </div>

                                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                                    {loading ? "Submitting..." : "Submit Project Request"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
