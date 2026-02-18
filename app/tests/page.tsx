"use client"

import { Navbar } from "@/components/navbar"
import Link from "next/link"
import useSWR from "swr"
import { useMemo, useState } from "react"
import { Clock, FileText, Award } from "lucide-react"

interface TestSummary {
  _id: string
  tag: string
  subject: string
  title: string
  summary?: string
  description?: string
  timeLimitMinutes: number
  mcQuestionCount: number
  frQuestionCount: number
  totalPoints: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function TestsPage() {
  const { data: tests, error, isLoading } = useSWR<TestSummary[]>("/api/tests", fetcher)
  const [nameFilter, setNameFilter] = useState("")
  const [tagFilter, setTagFilter] = useState("all")

  const filteredTests = useMemo(() => {
    return (tests || []).filter((test) => {
      const matchesName = test.title
        .toLowerCase()
        .includes(nameFilter.trim().toLowerCase())
      const matchesTag =
        tagFilter === "all" || String(test.tag) === tagFilter
      return matchesName && matchesTag
    })
  }, [tests, nameFilter, tagFilter])

  // Group tests by tag
  const grouped = filteredTests.reduce<Record<string, TestSummary[]>>(
    (acc, test) => {
      if (!acc[test.tag]) acc[test.tag] = []
      acc[test.tag].push(test)
      return acc
    },
    {}
  )

  const sortedTags = Object.keys(grouped).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  )
  const allTags = Array.from(new Set((tests || []).map((t) => t.tag))).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold text-foreground">Tests</h1>
          <p className="text-muted-foreground">
            Choose a test to practice. Multiple choice questions are auto-graded.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Filter by test name"
            className="sm:col-span-2 h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={String(tag)}>
                {tag}
              </option>
            ))}
          </select>
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

        {!isLoading && sortedTags.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {(tests || []).length === 0
                ? "No tests available yet. Check back soon!"
                : "No tests match the current name/tag filters."}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-8">
          {sortedTags.map((tag) => (
            <section key={tag}>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="h-8 px-3 bg-primary/10 text-primary rounded-md text-sm font-bold flex items-center">
                  {tag}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[tag].map((test) => (
                  <Link
                    key={test._id}
                    href={`/tests/${test._id}`}
                    className="group bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {test.title}
                        </h3>
                        {test.summary && (
                          <p className="mt-1 text-sm italic text-muted-foreground">
                            "{test.summary}"
                          </p>
                        )}
                      </div>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                        {test.subject}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-auto">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {test.timeLimitMinutes > 0
                          ? `${test.timeLimitMinutes} min`
                          : "Unlimited"}
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
