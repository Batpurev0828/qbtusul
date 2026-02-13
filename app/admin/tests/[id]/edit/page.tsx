"use client"

import { Navbar } from "@/components/navbar"
import { TestEditorForm } from "@/components/test-editor-form"
import { useAuth } from "@/components/auth-provider"
import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"
import useSWR from "swr"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EditTestPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const { data: test, isLoading } = useSWR(
    user?.role === "admin" ? `/api/tests/${id}` : null,
    fetcher
  )

  if (authLoading || isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    )
  }

  if (!test || test.error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Test not found.</p>
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
          Edit: {test.title}
        </h1>
        <TestEditorForm mode="edit" initialData={test} />
      </main>
    </div>
  )
}
