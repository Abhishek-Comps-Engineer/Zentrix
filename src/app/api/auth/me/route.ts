import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: Request) {
    try {
        const token = (await cookies()).get("token")?.value

        if (!token) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod")
        const { payload } = await jwtVerify(token, secret)

        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { id: true, name: true, email: true, role: true }
        })

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, user }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }
}
