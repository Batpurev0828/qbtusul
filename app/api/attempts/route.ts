import { NextResponse, type NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import Test from "@/lib/models/test"
import TestAttempt from "@/lib/models/test-attempt"
import { verifyToken } from "@/lib/auth"

// POST submit a test attempt
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("gee-auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()
    const { testId, mcAnswers, frAnswers, startedAt } = body

    // Fetch the full test with correct answers
    const test = await Test.findById(testId).lean()
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Grade MC questions
    let mcScore = 0
    const mcResults = (test.mcQuestions || []).map(
      (
        q: {
          questionText: string
          options: string[]
          correctAnswer: number
          points: number
          solution: string
          order: number
        },
        i: number
      ) => {
        const userAnswer = mcAnswers?.[i] ?? -1
        const isCorrect = userAnswer === q.correctAnswer
        if (isCorrect) mcScore += q.points || 1
        return {
          questionIndex: i,
          questionText: q.questionText,
          options: q.options,
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          points: q.points || 1,
          earnedPoints: isCorrect ? q.points || 1 : 0,
          solution: q.solution || "",
        }
      }
    )

    // Grade FR questions by exact match against configured correctAnswer
    let frScore = 0
    const frResults = (test.frQuestions || []).map(
      (
        q: {
          questionText: string
          correctAnswer: string
          points: number
          solution: string
          order: number
        },
        i: number
      ) => {
        const userAnswer = frAnswers?.[i] || ""
        const correctAnswer = q.correctAnswer || ""
        const isCorrect =
          correctAnswer.length > 0 && userAnswer === correctAnswer
        const earnedPoints = isCorrect ? q.points || 1 : 0
        frScore += earnedPoints

        return {
          questionIndex: i,
          questionText: q.questionText,
          userAnswer,
          correctAnswer,
          isCorrect,
          points: q.points || 1,
          earnedPoints,
          solution: q.solution || "",
        }
      }
    )

    const totalMCPoints = (test.mcQuestions || []).reduce(
      (s: number, q: { points?: number }) => s + (q.points || 1),
      0
    )
    const totalFRPoints = (test.frQuestions || []).reduce(
      (s: number, q: { points?: number }) => s + (q.points || 1),
      0
    )

    const attempt = await TestAttempt.create({
      userId: payload.userId,
      testId,
      mcAnswers: mcResults,
      frAnswers: frResults,
      mcScore,
      totalMCPoints,
      totalFRPoints,
      totalScore: mcScore + frScore,
      totalPossible: totalMCPoints + totalFRPoints,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      submittedAt: new Date(),
    })

    return NextResponse.json({ attemptId: attempt._id }, { status: 201 })
  } catch (error) {
    console.error("Error submitting attempt:", error)
    return NextResponse.json(
      { error: "Failed to submit attempt" },
      { status: 500 }
    )
  }
}

// GET user's attempts
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("gee-auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const attempts = await TestAttempt.find({ userId: payload.userId })
      .populate("testId", "title year subject")
      .sort({ submittedAt: -1 })
      .lean()

    return NextResponse.json(attempts)
  } catch (error) {
    console.error("Error fetching attempts:", error)
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    )
  }
}
