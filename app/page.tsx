"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { BookOpen, Clock, CheckCircle, BarChart3 } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Past Year Tests",
    description:
      "Access a comprehensive collection of previous GEE exams organized by year.",
  },
  {
    icon: Clock,
    title: "Timed Practice",
    description:
      "Simulate real exam conditions with custom time limits on every test.",
  },
  {
    icon: CheckCircle,
    title: "Auto-graded MCQs",
    description:
      "Multiple choice questions are graded instantly so you know where you stand.",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    description:
      "See your score breakdown per question with solutions and explanations.",
  },
]

export default function HomePage() {
  const { user, isLoading: loading } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
            <BookOpen className="h-4 w-4" />
            Mongolian GEE Practice Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance leading-tight">
            Master your GEE exam with past year practice
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
            Prepare for the Mongolian General Entrance Examination with our
            extensive question bank. Practice with real past year questions, get
            instant feedback on multiple choice, and review detailed solutions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {!loading && !user ? (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center h-11 px-6 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  Get started free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-11 px-6 border border-border bg-card text-foreground font-medium rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  Sign in
                </Link>
              </>
            ) : !loading ? (
              <Link
                href="/tests"
                className="inline-flex items-center justify-center h-11 px-6 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                Browse tests
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10 text-balance">
            Everything you need to prepare
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-background"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>GEE Question Bank</span>
          <span>Practice makes perfect</span>
        </div>
      </footer>
    </div>
  )
}
