"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut } from "lucide-react"
import { requestCategoryLabel, requestPriorityLabel, requestStatusLabel } from "@/lib/service-requests"

type DashboardUser = {
  id: string
  name: string
  email: string
}

type ServiceRequest = {
  id: string
  title: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
}

type Notification = {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

type SupportReply = {
  id: string
  message: string
  sender: { name: string; role: "USER" | "ADMIN" }
  createdAt: string
}

type SupportTicket = {
  id: string
  subject: string
  message: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  replies: SupportReply[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [requestQuery, setRequestQuery] = useState("")
  const [requestStatus, setRequestStatus] = useState("ALL")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [replyMap, setReplyMap] = useState<Record<string, string>>({})

  const fetchDashboardData = useCallback(async () => {
    const [meRes, reqRes, notificationRes, supportRes] = await Promise.all([
      fetch("/api/auth/me", { cache: "no-store" }),
      fetch("/api/services?limit=100", { cache: "no-store" }),
      fetch("/api/notifications", { cache: "no-store" }),
      fetch("/api/support", { cache: "no-store" }),
    ])

    if (!meRes.ok) {
      router.push("/login")
      return null
    }

    const [meData, reqData, notificationData, supportData] = await Promise.all([
      meRes.json(),
      reqRes.json(),
      notificationRes.json(),
      supportRes.json(),
    ])

    return {
      user: meData.user || null,
      requests: reqData.requests || [],
      notifications: notificationData.notifications || [],
      tickets: supportData.tickets || [],
    }
  }, [router])

  const loadData = useCallback(async () => {
    const data = await fetchDashboardData()
    if (!data) return

    setUser(data.user)
    setRequests(data.requests)
    setNotifications(data.notifications)
    setTickets(data.tickets)
  }, [fetchDashboardData])

  useEffect(() => {
    let cancelled = false

    async function initialize() {
      try {
        const data = await fetchDashboardData()
        if (!data || cancelled) return
        setUser(data.user)
        setRequests(data.requests)
        setNotifications(data.notifications)
        setTickets(data.tickets)
      } catch {
        if (!cancelled) {
          toast("Error", { description: "Failed to load dashboard." })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void initialize()
    return () => {
      cancelled = true
    }
  }, [fetchDashboardData])

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesStatus = requestStatus === "ALL" || request.status === requestStatus
      const normalizedQuery = requestQuery.trim().toLowerCase()
      const matchesQuery =
        normalizedQuery.length === 0 ||
        request.id.toLowerCase().includes(normalizedQuery) ||
        request.title.toLowerCase().includes(normalizedQuery)
      return matchesStatus && matchesQuery
    })
  }, [requestQuery, requestStatus, requests])

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  async function createSupportTicket() {
    if (!subject.trim() || !message.trim()) {
      toast("Error", { description: "Subject and message are required." })
      return
    }
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    })
    const data = await res.json()
    if (!res.ok) return toast("Error", { description: data.message || "Failed to submit support request." })
    setSubject("")
    setMessage("")
    toast("Success", { description: "Support request submitted." })
    await loadData()
  }

  async function replyToTicket(ticketId: string) {
    const content = (replyMap[ticketId] || "").trim()
    if (!content) return

    const res = await fetch(`/api/support/${ticketId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content }),
    })
    const data = await res.json()
    if (!res.ok) return toast("Error", { description: data.message || "Failed to send reply." })
    setReplyMap((prev) => ({ ...prev, [ticketId]: "" }))
    await loadData()
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-all-read" }),
    })
    await loadData()
  }

  async function clearRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear-read" }),
    })
    await loadData()
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading dashboard...</div>

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Dashboard</h1>
          <p className="text-muted-foreground">{user?.name} ({user?.email})</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Service Requests</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {notifications.some((n) => !n.isRead) && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Your Requests</CardTitle>
              <CardDescription>Create, filter, and track your service request lifecycle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Search by ID or title..."
                  value={requestQuery}
                  onChange={(event) => setRequestQuery(event.target.value)}
                />
                <Select value={requestStatus} onValueChange={setRequestStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="WAITING_FOR_USER">Waiting for User</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button asChild variant="outline">
                  <Link href="/request-service">New Request</Link>
                </Button>
              </div>

              {filteredRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No requests found.</p>
              ) : (
                <div className="space-y-2">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="rounded border p-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <p className="font-medium">{request.title}</p>
                          <p className="text-xs text-muted-foreground">Request ID: {request.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {requestCategoryLabel(request.category)} | {requestPriorityLabel(request.priority)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(request.createdAt).toLocaleString()} | Updated: {new Date(request.updatedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{requestStatusLabel(request.status)}</Badge>
                          <Button asChild size="sm">
                            <Link href={`/dashboard/requests/${request.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Support Request</CardTitle>
                <CardDescription>Raise an issue and track replies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                <Textarea placeholder="Describe your issue..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <Button onClick={createSupportTicket}>Submit Support Request</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Support Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No support tickets.</p>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="rounded border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{ticket.subject}</p>
                        <Badge variant="outline">{ticket.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.message}</p>
                      {ticket.replies.map((reply) => (
                        <div key={reply.id} className="rounded bg-muted/40 p-2 text-sm">
                          <p className="font-medium">{reply.sender.name} ({reply.sender.role})</p>
                          <p>{reply.message}</p>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Write reply..."
                          value={replyMap[ticket.id] || ""}
                          onChange={(e) =>
                            setReplyMap((prev) => ({
                              ...prev,
                              [ticket.id]: e.target.value,
                            }))
                          }
                        />
                        <Button onClick={() => replyToTicket(ticket.id)}>Reply</Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Notifications</CardTitle>
                <CardDescription>Replies, project updates, and announcements.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={markAllRead}>Mark all read</Button>
                <Button variant="outline" onClick={clearRead}>Clear read</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications available.</p>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="rounded border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{notification.title}</p>
                      {!notification.isRead && <Badge>Unread</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
