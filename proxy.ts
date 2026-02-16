import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-me")
const COOKIE_NAME = "gee-auth-token"

const protectedRoutes = ["/admin", "/tests/"]
const authRoutes = ["/login", "/signup"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value

  let user: { userId: string; role: string } | null = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      user = payload as unknown as { userId: string; role: string }
    } catch {
      // Invalid token
    }
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((route) => pathname.startsWith(route)) && user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Protect test-taking routes
  if (pathname.match(/^\/tests\/[^/]+\/take/) && !user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/tests/:path*", "/login", "/signup"],
}
