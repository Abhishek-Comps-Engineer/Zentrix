"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, FileText, User } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
    const router = useRouter()
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/auth/me")
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                }

                const reqRes = await fetch("/api/services")
                if (reqRes.ok) {
                    const reqData = await reqRes.json()
                    setRequests(reqData.requests || [])
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" })
        router.push("/")
        router.refresh()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Client Dashboard</h1>
                    <p className="text-muted-foreground">Manage your service requests and profile.</p>
                </div>
                <div className="flex gap-2">
                    {user && (
                        <div className="flex items-center gap-2 mr-4 text-sm font-medium border rounded-full px-4 py-1.5">
                            <User className="h-4 w-4" /> {user.name}
                        </div>
                    )}
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Your Requests</CardTitle>
                                <CardDescription>Track the status of your project requests.</CardDescription>
                            </div>
                            <Button onClick={() => router.push("/request-service")}>
                                New Request
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ) : requests.length > 0 ? (
                                <div className="space-y-4">
                                    {requests.map((req) => (
                                        <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                            <div className="space-y-1 mb-2 md:mb-0">
                                                <div className="font-semibold">{req.serviceType.replace("_", " ")}</div>
                                                <div className="text-sm text-muted-foreground line-clamp-1 max-w-[400px]">
                                                    {req.details}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Submitted on {new Date(req.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={
                                                    req.status === "COMPLETED" ? "default" :
                                                        req.status === "REJECTED" ? "destructive" :
                                                            req.status === "PENDING" ? "secondary" : "outline"
                                                }>
                                                    {req.status}
                                                </Badge>
                                                <Button variant="ghost" size="icon">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    You haven't made any requests yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                            <CardDescription>Summary of your activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">Total Requests</span>
                                    <span className="font-bold">{requests.length}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">Active Projects</span>
                                    <span className="font-bold">{requests.filter(r => r.status === "APPROVED" || r.status === "IN_REVIEW").length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Have questions about your request or need immediate assistance?
                            </p>
                            <Button variant="outline" className="w-full" asChild>
                                <a href="mailto:support@zentrix.dev">Contact Support</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
