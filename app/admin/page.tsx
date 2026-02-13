"use client"

import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  FileText,
} from "lucide-react"

interface AdminTest {
  _id: string
  year: number
  subject: string
  title: string
  timeLimitMinutes: number
  mcQuestionCount: number
  frQuestionCount: number
  totalPoints: number
  published?: boolean
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const {
    data: tests,
    error,
    isLoading,
    mutate,
  } = useSWR<AdminTest[]>("/api/admin/tests", fetcher)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/tests/${id}`, { method: "DELETE" })
      if (res.ok) {
        mutate()
      }
    } finally {
      setDeleting(null)
    }
  }

  const togglePublish = async (id: string, published: boolean) => {
    await fetch(`/api/tests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    })
    mutate()
  }

  if (authLoading || !user || user.role !== "admin") {
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
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage past year GEE tests
            </p>
          </div>
          <Link
            href="/admin/tests/new"
            className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New Test
          </Link>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
            Failed to load tests.
          </div>
        )}

        {!isLoading && tests && tests.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No tests yet. Create your first test!
            </p>
          </div>
        )}

        {tests && tests.length > 0 && (
          <div className="flex flex-col gap-3">
            {tests.map((test) => (
              <div
                key={test._id}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {test.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        test.published
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {test.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>Year: {test.year}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {test.timeLimitMinutes} min
                    </span>
                    <span>
                      {test.mcQuestionCount} MC + {test.frQuestionCount} FR
                    </span>
                    <span>{test.totalPoints} pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => togglePublish(test._id, !!test.published)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                    title={test.published ? "Unpublish" : "Publish"}
                  >
                    {test.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <Link
                    href={`/admin/tests/${test._id}/edit`}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(test._id)}
                    disabled={deleting === test._id}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-muted disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
