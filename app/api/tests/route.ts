import { NextResponse, type NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import Test from "@/lib/models/test"
import { verifyToken } from "@/lib/auth"

// GET all tests (public - but only basic info)
export async function GET() {
  try {
    await connectDB()
    const tests = await Test.find({ published: true })
      .select("year subject title timeLimitMinutes mcQuestions frQuestions")
      .sort({ year: -1 })
      .lean()

    const testsWithCounts = tests.map((t) => ({
      _id: t._id,
      year: t.year,
      subject: t.subject,
      title: t.title,
      timeLimitMinutes: t.timeLimitMinutes,
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
    console.error("Error fetching tests:", error)
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    )
  }
}

// POST create a new test (admin only)
export async function POST(request: NextRequest) {
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
    const body = await request.json()

    const test = await Test.create({
      year: body.year,
      subject: body.subject || "General",
      title: body.title || `GEE ${body.year}`,
      timeLimitMinutes: body.timeLimitMinutes || 120,
      mcQuestions: body.mcQuestions || [],
      frQuestions: body.frQuestions || [],
      published: body.published ?? false,
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json(
      { error: "Failed to create test" },
      { status: 500 }
    )
  }
}
