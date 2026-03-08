"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Users, FileText, Settings, User } from "lucide-react"

export default function AdminDashboardPage() {
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
                    if (data.user.role !== "ADMIN") {
                        router.push("/dashboard")
                        return
                    }
                    setUser(data.user)
                } else {
                    router.push("/login")
                    return
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
    }, [router])

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" })
        router.push("/")
        router.refresh()
    }

    // Calculate simple stats
    const totalRequests = requests.length
    const pendingRequests = requests.filter(r => r.status === "PENDING" || r.status === "IN_REVIEW").length
    const completedRequests = requests.filter(r => r.status === "COMPLETED").length

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Control Panel</h1>
                    <p className="text-muted-foreground">Manage platform operations and view analytics.</p>
                </div>
                <div className="flex gap-2">
                    {user && (
                        <div className="flex items-center gap-2 mr-4 text-sm font-medium border rounded-full px-4 py-1.5">
                            <User className="h-4 w-4" /> Admin: {user.name}
                        </div>
                    )}
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRequests}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active / Pending</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">Needs review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedRequests}</div>
                        <p className="text-xs text-muted-foreground">Successfully delivered</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="requests" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="requests">Service Requests</TabsTrigger>
                    <TabsTrigger value="projects">Portfolio Projects</TabsTrigger>
                    <TabsTrigger value="users">Manage Users</TabsTrigger>
                </TabsList>
                <TabsContent value="requests" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Service Requests</CardTitle>
                            <CardDescription>Review and update client service requests.</CardDescription>
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
                                        <div key={req.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="space-y-1 mb-4 lg:mb-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{req.user?.name || "Unknown User"}</span>
                                                    <span className="text-sm text-muted-foreground">- {req.user?.email || ""}</span>
                                                </div>
                                                <div className="font-medium text-primary text-sm">{req.serviceType.replace("_", " ")}</div>
                                                <div className="text-sm text-muted-foreground line-clamp-2 max-w-[600px]">
                                                    {req.details}
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                <div className="text-sm">Budget: {req.budget || "N/A"}</div>
                                                <Badge variant={
                                                    req.status === "COMPLETED" ? "default" :
                                                        req.status === "REJECTED" ? "destructive" :
                                                            req.status === "PENDING" ? "secondary" : "outline"
                                                }>
                                                    {req.status}
                                                </Badge>
                                                <Button size="sm" variant="outline">Update Status</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    No requests found in the system.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="projects">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Portfolio</CardTitle>
                            <CardDescription>Add, edit, or remove projects from the public portfolio.</CardDescription>
                        </CardHeader>
                        <CardContent className="py-20 text-center text-muted-foreground">
                            [Portfolio Management UI Placeholder]
                            <br />
                            <Button className="mt-4">Add New Project</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Directory</CardTitle>
                            <CardDescription>Manage client accounts and permissions.</CardDescription>
                        </CardHeader>
                        <CardContent className="py-20 text-center text-muted-foreground">
                            [User Management UI Placeholder]
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
