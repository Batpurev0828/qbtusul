import { SignJWT, jwtVerify } from "jose"
import { hash, compare } from "bcryptjs"
import { cookies } from "next/headers"
import { connectDB } from "./db"
import { User, type IUser } from "./models/user"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-me")
const COOKIE_NAME = "gee-auth-token"

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export async function signToken(payload: { userId: string; role: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as { userId: string; role: string }
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value ?? null
}

export async function getCurrentUser(): Promise<IUser | null> {
  const token = await getAuthToken()
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  await connectDB()
  const user = await User.findById(payload.userId).select("-passwordHash").lean()
  return user as IUser | null
}

export async function requireAuth(): Promise<IUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function requireAdmin(): Promise<IUser> {
  const user = await requireAuth()
  if (user.role !== "admin") throw new Error("Forbidden")
  return user
}
