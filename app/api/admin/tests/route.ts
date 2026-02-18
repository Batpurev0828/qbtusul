import { NextResponse, type NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import Test from "@/lib/models/test"
import { verifyToken } from "@/lib/auth"

// GET all tests with full info for admin
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("gee-auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await connectDB()
    const tests = await Test.find()
      .select(
        "tag year subject title summary description timeLimitMinutes published mcQuestions frQuestions"
      )
      .sort({ createdAt: -1 })
      .lean()

    const testsWithCounts = tests.map((t) => ({
      _id: t._id,
      tag:
        (typeof t.tag === "string" && t.tag) ||
        (typeof (t as { year?: number }).year === "number"
          ? String((t as { year?: number }).year)
          : "untagged"),
      subject: t.subject,
      title: t.title,
      summary: t.summary || t.description || "",
      description: t.description || "",
      timeLimitMinutes: t.timeLimitMinutes,
      published: t.published,
      mcQuestionCount: Array.isArray(t.mcQuestions) ? t.mcQuestions.length : 0,
      frQuestionCount: Array.isArray(t.frQuestions) ? t.frQuestions.length : 0,
      totalPoints:
        (Array.isArray(t.mcQuestions)
          ? t.mcQuestions.reduce(
              (sum: number, q: { points?: number }) => sum + (q.points || 1),
              0
            )
          : 0) +
        (Array.isArray(t.frQuestions)
          ? t.frQuestions.reduce(
              (sum: number, q: { points?: number }) => sum + (q.points || 1),
              0
            )
          : 0),
    }))

    return NextResponse.json(testsWithCounts)
  } catch (error) {
    console.error("Error fetching admin tests:", error)
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    )
  }
}
