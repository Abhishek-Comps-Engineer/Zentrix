import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { PrismaClient } from "@prisma/client"
import * as z from "zod"

const prisma = new PrismaClient()

const serviceSchema = z.object({
    serviceType: z.string(),
    details: z.string(),
    budget: z.string().optional(),
    timeline: z.string().optional(),
})

// Get all requests for a user (or all if admin)
export async function GET(req: Request) {
    try {
        const token = (await cookies()).get("token")?.value
        if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod")
        const { payload } = await jwtVerify(token, secret)

        // Admin can see all, user can see only theirs
        let requests;
        if (payload.role === "ADMIN") {
            requests = await prisma.serviceRequest.findMany({
                include: { user: { select: { name: true, email: true } } },
                orderBy: { createdAt: "desc" }
            })
        } else {
            requests = await prisma.serviceRequest.findMany({
                where: { userId: payload.userId as string },
                orderBy: { createdAt: "desc" }
            })
        }

        return NextResponse.json({ success: true, requests }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
    }
}

// Create a new request
export async function POST(req: Request) {
    try {
        const token = (await cookies()).get("token")?.value
        if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod")
        const { payload } = await jwtVerify(token, secret)

        const body = await req.json()
        const parsed = serviceSchema.parse(body)

        const request = await prisma.serviceRequest.create({
            data: {
                userId: payload.userId as string,
                serviceType: parsed.serviceType,
                details: parsed.details,
                budget: parsed.budget,
                timeline: parsed.timeline,
            }
        })

        return NextResponse.json({ success: true, request }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: "Validation error", errors: error.issues }, { status: 400 })
        }
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
    }
}
