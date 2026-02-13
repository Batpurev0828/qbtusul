"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { KaTeXRenderer } from "@/components/katex-renderer"
import { TestTimer } from "@/components/test-timer"
import useSWR from "swr"
import {
  Send,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"

interface MCQ {
  questionText: string
  options: string[]
  points: number
  order: number
}

interface FRQ {
  questionText: string
  points: number
  order: number
}

interface TestData {
  _id: string
  title: string
  year: number
  subject: string
  timeLimitMinutes: number
  mcQuestions: MCQ[]
  frQuestions: FRQ[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function TakeTestPage() {
  const { user, isLoading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const hasSubmittedRef = useRef(false)

  const { data: test, isLoading } = useSWR<TestData>(
    `/api/tests/${id}`,
    fetcher
  )

  const [startedAt] = useState(() => new Date())
  const [mcAnswers, setMcAnswers] = useState<Record<number, number>>({})
  const [frAnswers, setFrAnswers] = useState<Record<number, string>>({})
  const [currentSection, setCurrentSection] = useState<"mc" | "fr">("mc")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleSubmit = useCallback(async () => {
    if (hasSubmittedRef.current) return
    hasSubmittedRef.current = true
    setSubmitting(true)

    try {
      // Convert mcAnswers from object to array
      const mcAnswerArray: number[] = []
      const mcLen = test?.mcQuestions?.length || 0
      for (let i = 0; i < mcLen; i++) {
        mcAnswerArray.push(mcAnswers[i] ?? -1)
      }

      const frAnswerArray: string[] = []
      const frLen = test?.frQuestions?.length || 0
      for (let i = 0; i < frLen; i++) {
        frAnswerArray.push(frAnswers[i] || "")
      }

      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: id,
          mcAnswers: mcAnswerArray,
          frAnswers: frAnswerArray,
          startedAt: startedAt.toISOString(),
        }),
      })

      const data = await res.json()
      if (data.attemptId) {
        router.push(`/attempts/${data.attemptId}`)
      }
    } catch (err) {
      console.error("Submit error:", err)
      hasSubmittedRef.current = false
    } finally {
      setSubmitting(false)
    }
  }, [test, mcAnswers, frAnswers, id, startedAt, router])

  const handleTimeUp = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  if (authLoading || isLoading || !test || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const mcQuestions = test.mcQuestions || []
  const frQuestions = test.frQuestions || []
  const currentQuestions = currentSection === "mc" ? mcQuestions : frQuestions
  const currentQ = currentQuestions[currentIndex]
  const totalQuestions = mcQuestions.length + frQuestions.length
  const answeredMC = Object.keys(mcAnswers).length
  const answeredFR = Object.values(frAnswers).filter((a) => a.trim()).length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-foreground text-sm sm:text-base truncate">
              {test.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <TestTimer
              durationMinutes={test.timeLimitMinutes}
              startedAt={startedAt}
              onTimeUp={handleTimeUp}
            />
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Question navigation sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4 sticky top-20">
            {/* Section tabs */}
            <div className="flex gap-1">
              {mcQuestions.length > 0 && (
                <button
                  onClick={() => {
                    setCurrentSection("mc")
                    setCurrentIndex(0)
                  }}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                    currentSection === "mc"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  MC ({mcQuestions.length})
                </button>
              )}
              {frQuestions.length > 0 && (
                <button
                  onClick={() => {
                    setCurrentSection("fr")
                    setCurrentIndex(0)
                  }}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                    currentSection === "fr"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  FR ({frQuestions.length})
                </button>
              )}
            </div>

            {/* Question grid */}
            <div className="grid grid-cols-5 gap-1.5">
              {currentQuestions.map((_, i) => {
                const isAnswered =
                  currentSection === "mc"
                    ? mcAnswers[i] !== undefined
                    : (frAnswers[i] || "").trim().length > 0
                const isCurrent = i === currentIndex
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-8 w-full rounded-md text-xs font-medium transition-colors ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isAnswered
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <div className="text-xs text-muted-foreground">
              Answered: {answeredMC + answeredFR} / {totalQuestions}
            </div>
          </div>
        </aside>

        {/* Current question */}
        <div className="flex-1 min-w-0">
          {currentQ && (
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">
                  {currentSection === "mc" ? "Multiple Choice" : "Free Response"}{" "}
                  #{currentIndex + 1}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {currentQ.points} {currentQ.points === 1 ? "point" : "points"}
                </span>
              </div>

              <KaTeXRenderer
                content={currentQ.questionText}
                className="text-foreground leading-relaxed"
              />

              {/* MC options */}
              {currentSection === "mc" && "options" in currentQ && (
                <div className="flex flex-col gap-2">
                  {(currentQ as MCQ).options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() =>
                        setMcAnswers((prev) => ({
                          ...prev,
                          [currentIndex]: oi,
                        }))
                      }
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-colors ${
                        mcAnswers[currentIndex] === oi
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/30"
                      }`}
                    >
                      <span
                        className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                          mcAnswers[currentIndex] === oi
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <KaTeXRenderer content={opt} className="flex-1" />
                    </button>
                  ))}
                </div>
              )}

              {/* FR answer box */}
              {currentSection === "fr" && (
                <textarea
                  value={frAnswers[currentIndex] || ""}
                  onChange={(e) =>
                    setFrAnswers((prev) => ({
                      ...prev,
                      [currentIndex]: e.target.value,
                    }))
                  }
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  placeholder="Write your answer here..."
                />
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <button
                  onClick={() => {
                    if (currentIndex > 0) {
                      setCurrentIndex(currentIndex - 1)
                    } else if (
                      currentSection === "fr" &&
                      mcQuestions.length > 0
                    ) {
                      setCurrentSection("mc")
                      setCurrentIndex(mcQuestions.length - 1)
                    }
                  }}
                  disabled={currentIndex === 0 && currentSection === "mc"}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (currentIndex < currentQuestions.length - 1) {
                      setCurrentIndex(currentIndex + 1)
                    } else if (
                      currentSection === "mc" &&
                      frQuestions.length > 0
                    ) {
                      setCurrentSection("fr")
                      setCurrentIndex(0)
                    }
                  }}
                  disabled={
                    currentIndex === currentQuestions.length - 1 &&
                    (currentSection === "fr" || frQuestions.length === 0)
                  }
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm submit modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center px-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-foreground">
              Submit test?
            </h3>
            <p className="text-sm text-muted-foreground">
              You have answered {answeredMC} of {mcQuestions.length} MC questions
              and {answeredFR} of {frQuestions.length} FR questions. This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false)
                  handleSubmit()
                }}
                disabled={submitting}
                className="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
