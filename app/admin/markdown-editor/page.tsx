"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { MarkdownRenderer } from "@/components/markdown-renderer"

const starterMarkdown = `# Markdown + KaTeX Editor

Write Markdown on the left and see live preview on the right.

Inline math: $x^2 + y^2 = z^2$

Display math:

$$
\\int_0^1 x^2\\,dx = \\frac{1}{3}
$$

- Supports **bold**, *italic*, lists, links, and code blocks.
- Supports images: ![alt](https://example.com/image.png)
`

export default function AdminMarkdownEditorPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [content, setContent] = useState(starterMarkdown)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [authLoading, router, user])

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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Markdown + KaTeX Editor
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Large split view: editor on the left, live preview on the right.
        </p>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[78vh]">
          <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-card">
            <div className="px-4 py-2 border-b border-border text-sm font-medium">
              Editor
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full min-h-[60vh] lg:min-h-0 resize-none bg-background px-4 py-4 text-sm text-foreground font-mono leading-6 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Write markdown with LaTeX here..."
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-card">
            <div className="px-4 py-2 border-b border-border text-sm font-medium">
              Live Preview
            </div>
            <div className="flex-1 min-h-[60vh] lg:min-h-0 overflow-auto bg-background px-4 py-4">
              <MarkdownRenderer
                content={content}
                className="prose prose-neutral dark:prose-invert max-w-none text-foreground"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
