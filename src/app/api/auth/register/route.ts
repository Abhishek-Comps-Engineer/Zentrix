import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import * as z from "zod"

const prisma = new PrismaClient()

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, password } = registerSchema.parse(body)

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "User with this email already exists." },
                { status: 409 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                // The first user could be an ADMIN or handled through a seed script. We default to USER.
            },
            select: { id: true, name: true, email: true, role: true },
        })

        return NextResponse.json(
            { success: true, message: "User registered successfully.", user },
            { status: 201 }
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
