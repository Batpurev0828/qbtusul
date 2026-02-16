"use client"

import { Navbar } from "@/components/navbar"
import { KaTeXRenderer } from "@/components/katex-renderer"
import { useAuth } from "@/components/auth-provider"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Award,
  Clock,
  ChevronDown,
} from "lucide-react"

interface MCResult {
  questionIndex: number
  questionText: string
  options: string[]
  userAnswer: number
  correctAnswer: number
  isCorrect: boolean
  points: number
  earnedPoints: number
  solution: string
}

interface FRResult {
  questionIndex: number
  questionText: string
  userAnswer: string
  points: number
  earnedPoints: number
  solution: string
}

interface AttemptData {
  _id: string
  testId: {
    _id: string
    title: string
    year: number
    subject: string
    timeLimitMinutes: number
  }
  mcAnswers: MCResult[]
  frAnswers: FRResult[]
  mcScore: number
  totalMCPoints: number
  totalFRPoints: number
  totalScore: number
  totalPossible: number
  startedAt: string
  submittedAt: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AttemptDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: attempt, isLoading } = useSWR<AttemptData>(
    user ? `/api/attempts/${id}` : null,
    fetcher
  )

  const [expandedMC, setExpandedMC] = useState<Set<number>>(new Set())
  const [expandedFR, setExpandedFR] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const toggleMC = (i: number) => {
    setExpandedMC((prev) => {
      const n = new Set(prev)
      if (n.has(i)) n.delete(i)
      else n.add(i)
      return n
    })
  }

  const toggleFR = (i: number) => {
    setExpandedFR((prev) => {
      const n = new Set(prev)
      if (n.has(i)) n.delete(i)
      else n.add(i)
      return n
    })
  }

  if (authLoading || isLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    )
  }

  if (!attempt || "error" in attempt) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Attempt not found.</p>
        </main>
      </div>
    )
  }

  const duration = Math.round(
    (new Date(attempt.submittedAt).getTime() -
      new Date(attempt.startedAt).getTime()) /
      60000
  )
  const mcPercentage =
    attempt.totalMCPoints > 0
      ? Math.round((attempt.mcScore / attempt.totalMCPoints) * 100)
      : 0
  const frScore = attempt.frAnswers.reduce((sum, fr) => sum + fr.earnedPoints, 0)
  const totalPercentage =
    attempt.totalPossible > 0
      ? Math.round((attempt.totalScore / attempt.totalPossible) * 100)
      : 0

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Link
          href="/my-attempts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Attempts
        </Link>

        {/* Score header */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Score Report
              </h1>
              <p className="text-muted-foreground mt-1">
                {attempt.testId.title} ({attempt.testId.year})
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {totalPercentage}%
              </div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Award className="h-4 w-4" />
                <span className="text-xs font-medium">MC Score</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {attempt.mcScore} / {attempt.totalMCPoints}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">FR Score</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {attempt.frAnswers.reduce((sum, fr) => sum + fr.earnedPoints, 0)} / {attempt.totalFRPoints}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">MC Correct</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {attempt.mcAnswers.filter((a) => a.isCorrect).length} /{" "}
                {attempt.mcAnswers.length}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Time Used</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {duration} min
              </span>
            </div>
          </div>
        </div>

        {/* MC question results */}
        {attempt.mcAnswers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Multiple Choice Results
            </h2>
            <div className="flex flex-col gap-3">
              {attempt.mcAnswers.map((mc, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleMC(i)}
                    className="w-full p-4 flex items-center gap-3 text-left"
                  >
                    {mc.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive shrink-0" />
                    )}
                    <span className="flex-1 font-medium text-sm text-foreground">
                      Question {i + 1}
                    </span>
                    <span
                      className={`text-sm font-bold ${mc.isCorrect ? "text-green-600" : "text-destructive"}`}
                    >
                      {mc.earnedPoints}/{mc.points}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${expandedMC.has(i) ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedMC.has(i) && (
                    <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border pt-3">
                      <KaTeXRenderer
                        content={mc.questionText}
                        className="text-sm text-foreground leading-relaxed"
                      />
                      <div className="flex flex-col gap-1.5">
                        {mc.options.map((opt, oi) => {
                          const isUserAnswer = mc.userAnswer === oi
                          const isCorrectAnswer = mc.correctAnswer === oi
                          return (
                            <div
                              key={oi}
                              className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                                isCorrectAnswer
                                  ? "bg-green-50 border border-green-200"
                                  : isUserAnswer && !isCorrectAnswer
                                    ? "bg-red-50 border border-red-200"
                                    : "bg-muted/30"
                              }`}
                            >
                              <span
                                className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isCorrectAnswer
                                    ? "bg-green-600 text-primary-foreground"
                                    : isUserAnswer
                                      ? "bg-destructive text-destructive-foreground"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <KaTeXRenderer
                                content={opt}
                                className="flex-1 text-foreground"
                              />
                              {isCorrectAnswer && (
                                <span className="text-xs text-green-700 font-medium">
                                  Correct
                                </span>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <span className="text-xs text-destructive font-medium">
                                  Your answer
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {mc.solution && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-1">
                          <div className="text-xs font-medium text-primary mb-1.5">
                            Solution
                          </div>
                          <KaTeXRenderer
                            content={mc.solution}
                            className="text-sm text-foreground leading-relaxed"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FR question results */}
        {attempt.frAnswers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Free Response Results
            </h2>
            <div className="flex flex-col gap-3">
              {attempt.frAnswers.map((fr, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFR(i)}
                    className="w-full p-4 flex items-center gap-3 text-left"
                  >
                    {fr.earnedPoints === fr.points ? (
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    ) : fr.earnedPoints > 0 ? (
                      <FileText className="h-5 w-5 text-orange-600 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive shrink-0" />
                    )}
                    <span className="flex-1 font-medium text-sm text-foreground">
                      Question {i + 1}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        fr.earnedPoints === fr.points
                          ? "text-green-600"
                          : fr.earnedPoints > 0
                            ? "text-orange-600"
                            : "text-destructive"
                      }`}
                    >
                      {fr.earnedPoints}/{fr.points}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${expandedFR.has(i) ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedFR.has(i) && (
                    <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border pt-3">
                      <KaTeXRenderer
                        content={fr.questionText}
                        className="text-sm text-foreground leading-relaxed"
                      />
                      {fr.userAnswer && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="text-xs font-medium text-muted-foreground mb-1.5">
                            Your Answer
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {fr.userAnswer}
                          </p>
                        </div>
                      )}
                      {fr.solution && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                          <div className="text-xs font-medium text-primary mb-1.5">
                            Solution
                          </div>
                          <KaTeXRenderer
                            content={fr.solution}
                            className="text-sm text-foreground leading-relaxed"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
