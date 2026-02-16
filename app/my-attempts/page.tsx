"use client"

import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"
import { FileText, Award, Clock, ChevronRight } from "lucide-react"

interface AttemptSummary {
  _id: string
  testId: {
    _id: string
    title: string
    year: number
    subject: string
  }
  mcScore: number
  totalScore: number
  totalMCPoints: number
  totalFRPoints: number
  totalPossible: number
  startedAt: string
  submittedAt: string
  mcAnswers: { isCorrect: boolean }[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MyAttemptsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const {
    data: attempts,
    isLoading,
    error,
  } = useSWR<AttemptSummary[]>(user ? "/api/attempts" : null, fetcher)

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Attempts</h1>
          <p className="text-muted-foreground">
            Review your past test attempts and scores.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
            Failed to load attempts.
          </div>
        )}

        {!isLoading && attempts && attempts.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {"You haven't taken any tests yet."}
            </p>
            <Link
              href="/tests"
              className="text-primary text-sm font-medium hover:underline"
            >
              Browse tests
            </Link>
          </div>
        )}

        {attempts && attempts.length > 0 && (
          <div className="flex flex-col gap-3">
            {attempts.map((attempt) => {
              const totalPercentage =
                attempt.totalPossible > 0
                  ? Math.round(
                      (attempt.totalScore / attempt.totalPossible) * 100
                    )
                  : 0
              const duration = Math.round(
                (new Date(attempt.submittedAt).getTime() -
                  new Date(attempt.startedAt).getTime()) /
                  60000
              )
              const correctCount =
                attempt.mcAnswers?.filter((a) => a.isCorrect).length || 0

              return (
                <Link
                  key={attempt._id}
                  href={`/attempts/${attempt._id}`}
                  className="group bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                      totalPercentage >= 70
                        ? "bg-green-100 text-green-700"
                        : totalPercentage >= 40
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {totalPercentage}%
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                      {attempt.testId?.title || "Unknown Test"}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {attempt.totalScore}/{attempt.totalPossible} total pts
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {correctCount}/{attempt.mcAnswers?.length || 0} correct
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {duration} min
                      </span>
                      <span>
                        {new Date(attempt.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
