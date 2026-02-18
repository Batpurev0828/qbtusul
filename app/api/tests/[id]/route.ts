import { NextResponse, type NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import Test from "@/lib/models/test"
import { verifyToken } from "@/lib/auth"

const TAG_PATTERN = /^[A-Za-z0-9_-]+$/

// GET single test
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()
    const test = await Test.findById(id).lean()
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Check if admin - if not, strip correct answers for MC questions
    const token = request.cookies.get("gee-auth-token")?.value
    let isAdmin = false
    if (token) {
      const payload = await verifyToken(token)
      if (payload?.role === "admin") {
        isAdmin = true
      }
    }

    if (!isAdmin) {
      // Strip correct answers and solutions for test-taking
      const sanitized = {
        ...test,
        mcQuestions: (test.mcQuestions || []).map(
          (q: Record<string, unknown>) => ({
            ...q,
            correctAnswer: undefined,
            solution: undefined,
          })
        ),
        frQuestions: (test.frQuestions || []).map(
          (q: Record<string, unknown>) => ({
            ...q,
            correctAnswer: undefined,
            solution: undefined,
          })
        ),
      }
      return NextResponse.json(sanitized)
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error("Error fetching test:", error)
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    )
  }
}

// PUT update test (admin only)
export async function PUT(
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
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await connectDB()
    const body = await request.json()
    if ("tag" in body) {
      const tag = typeof body.tag === "string" ? body.tag.trim() : ""
      if (!tag || !TAG_PATTERN.test(tag)) {
        return NextResponse.json(
          {
            error:
              "Tag is required and must contain only letters, numbers, _ or -",
          },
          { status: 400 }
        )
      }
      body.tag = tag
    }

    const test = await Test.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error("Error updating test:", error)
    return NextResponse.json(
      { error: "Failed to update test" },
      { status: 500 }
    )
  }
}

// DELETE test (admin only)
export async function DELETE(
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
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await connectDB()
    const test = await Test.findByIdAndDelete(id)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting test:", error)
    return NextResponse.json(
      { error: "Failed to delete test" },
      { status: 500 }
    )
  }
}
