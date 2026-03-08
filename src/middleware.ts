import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Middleware to protect certain routes
export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value
    const { pathname } = request.nextUrl

    const publicRoutes = ["/login", "/register", "/", "/about", "/services", "/portfolio", "/contact"]
    const isPublicRoute = publicRoutes.some(r => pathname === r || pathname.startsWith("/api/auth"))

    // Optionally permit next static files
    if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")) {
        return NextResponse.next()
    }

    // If trying to access protected route without token
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verify JWT if token exists (using jose as it works in edge runtime)
    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod")
            const { payload } = await jwtVerify(token, secret)

            // Role-based access for admin routes
            if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/dashboard", request.url))
            }

            // Redirect logged-in users away from auth pages
            if (pathname === "/login" || pathname === "/register") {
                return NextResponse.redirect(new URL(payload.role === "ADMIN" ? "/admin" : "/dashboard", request.url))
            }
        } catch (error) {
            // Invalid token
            const response = NextResponse.redirect(new URL("/login", request.url))
            response.cookies.delete("token")
            return response
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/public (if any)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
