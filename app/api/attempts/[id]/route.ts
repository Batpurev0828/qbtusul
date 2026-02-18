import { NextResponse, type NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import TestAttempt from "@/lib/models/test-attempt"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.cookies.get("gee-auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const attempt = await TestAttempt.findById(id)
      .populate("testId", "title tag subject timeLimitMinutes")
      .lean()

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      )
    }

    // Users can only view their own attempts (or admin can view all)
    if (
      String(attempt.userId) !== payload.userId &&
      payload.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(attempt)
  } catch (error) {
    console.error("Error fetching attempt:", error)
    return NextResponse.json(
      { error: "Failed to fetch attempt" },
      { status: 500 }
    )
  }
}
