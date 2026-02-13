"use client"

import { Navbar } from "@/components/navbar"
import { TestEditorForm } from "@/components/test-editor-form"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewTestPage() {
  const { user, isLoading: loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== "admin") {
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
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Create New Test
        </h1>
        <TestEditorForm mode="create" />
      </main>
    </div>
  )
}
