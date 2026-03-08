import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import * as z from "zod"
import { cookies } from "next/headers"

const prisma = new PrismaClient()

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password } = loginSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials." },
                { status: 401 }
            )
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials." },
                { status: 401 }
            )
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod",
            { expiresIn: "1d" }
        )

        // Set HTTP-only cookie
        ;(await cookies()).set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        })

        return NextResponse.json(
            {
                success: true,
                message: "Logged in successfully.",
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            },
            { status: 200 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation error", errors: error.issues },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        )
    }
}
