"use client"

import { Navbar } from "@/components/navbar"
import Link from "next/link"
import useSWR from "swr"
import { Clock, FileText, Award } from "lucide-react"

interface TestSummary {
  _id: string
  year: number
  subject: string
  title: string
  timeLimitMinutes: number
  mcQuestionCount: number
  frQuestionCount: number
  totalPoints: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function TestsPage() {
  const { data: tests, error, isLoading } = useSWR<TestSummary[]>("/api/tests", fetcher)

  // Group tests by year
  const grouped = (tests || []).reduce<Record<number, TestSummary[]>>(
    (acc, test) => {
      if (!acc[test.year]) acc[test.year] = []
      acc[test.year].push(test)
      return acc
    },
    {}
  )

  const sortedYears = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold text-foreground">Past Year Tests</h1>
          <p className="text-muted-foreground">
            Choose a test to practice. Multiple choice questions are auto-graded.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
            Failed to load tests. Please try again later.
          </div>
        )}

        {!isLoading && sortedYears.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No tests available yet. Check back soon!
            </p>
          </div>
        )}

        <div className="flex flex-col gap-8">
          {sortedYears.map((year) => (
            <section key={year}>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="h-8 px-3 bg-primary/10 text-primary rounded-md text-sm font-bold flex items-center">
                  {year}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[year].map((test) => (
                  <Link
                    key={test._id}
                    href={`/tests/${test._id}`}
                    className="group bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {test.title}
                      </h3>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                        {test.subject}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-auto">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {test.timeLimitMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {test.mcQuestionCount} MC + {test.frQuestionCount} FR
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        {test.totalPoints} pts
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
