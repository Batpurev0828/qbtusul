"use client"

import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  FileText,
  Award,
  Play,
} from "lucide-react"

interface TestDetail {
  _id: string
  tag: string
  subject: string
  summary?: string
  title: string
  description?: string
  timeLimitMinutes: number
  mcQuestions: { questionText: string; points: number }[]
  frQuestions: { questionText: string; points: number }[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function TestDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: test, isLoading } = useSWR<TestDetail>(
    `/api/tests/${id}`,
    fetcher
  )

  const mcTotal =
    test?.mcQuestions?.reduce((s, q) => s + (q.points || 1), 0) || 0
  const frTotal =
    test?.frQuestions?.reduce((s, q) => s + (q.points || 1), 0) || 0

  const handleStart = () => {
    if (!user) {
      router.push("/login")
      return
    }
    router.push(`/tests/${id}/take`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <Link
          href="/tests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tests
        </Link>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {test && !("error" in test) && (
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-medium">
                  {test.tag}
                </span>
                <span className="text-sm text-muted-foreground">
                  {test.subject}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground text-balance">
                {test.title}
              </h1>
              {test.description && (
                <p className="mt-2 text-base text-muted-foreground">
                  {test.description}
                </p>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
              <h2 className="font-semibold text-foreground">Test Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Time Limit
                    </span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {test.timeLimitMinutes > 0
                      ? `${test.timeLimitMinutes} min`
                      : "Unlimited"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      MC Questions
                    </span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {test.mcQuestions?.length || 0}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      FR Questions
                    </span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {test.frQuestions?.length || 0}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Total Points
                    </span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {mcTotal + frTotal}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3">
              <h2 className="font-semibold text-foreground">Before you start</h2>
              <ul className="text-sm text-muted-foreground flex flex-col gap-2 leading-relaxed">
                <li>
                  - {test.timeLimitMinutes > 0
                    ? 'The timer will start as soon as you click "Start Test" and the test will auto-submit when time runs out.'
                    : "This test has unlimited time and will not auto-submit."}
                </li>
                <li>
                  - Multiple choice questions will be auto-graded immediately.
                </li>
                <li>
                  - Free response answers are auto-graded by exact match with
                  the expected answer, and solutions are shown after submission.
                </li>
                <li>
                  - You can review your answers and see solutions after
                  submitting.
                </li>
              </ul>
            </div>

            <button
              onClick={handleStart}
              disabled={authLoading}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-primary text-primary-foreground font-medium rounded-xl text-base hover:opacity-90 transition-opacity self-start"
            >
              <Play className="h-5 w-5" />
              {user ? "Start Test" : "Sign in to Start"}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
