"use client"

import { useMemo } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

interface KaTeXRendererProps {
  content: string
  className?: string
}

/**
 * Renders text content with inline LaTeX ($...$) and display LaTeX ($$...$$).
 * Also renders images as markdown-style: ![alt](url)
 */
export function KaTeXRenderer({ content, className }: KaTeXRendererProps) {
  const rendered = useMemo(() => {
    if (!content) return ""

    // Split by display math ($$...$$), inline math ($...$), and images ![alt](url)
    const parts: string[] = []
    let remaining = content

    // Process the content character by character to handle $$, $, and ![](url)
    while (remaining.length > 0) {
      // Check for image syntax ![alt](url)
      const imgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
      if (imgMatch) {
        parts.push(
          `<img src="${imgMatch[2]}" alt="${imgMatch[1]}" class="max-w-full rounded-lg my-2 inline-block" />`
        )
        remaining = remaining.slice(imgMatch[0].length)
        continue
      }

      // Check for display math $$...$$
      if (remaining.startsWith("$$")) {
        const end = remaining.indexOf("$$", 2)
        if (end !== -1) {
          const latex = remaining.slice(2, end)
          try {
            parts.push(
              katex.renderToString(latex, {
                displayMode: true,
                throwOnError: false,
              })
            )
          } catch {
            parts.push(`<span class="text-destructive">${latex}</span>`)
          }
          remaining = remaining.slice(end + 2)
          continue
        }
      }

      // Check for inline math $...$
      if (remaining.startsWith("$")) {
        const end = remaining.indexOf("$", 1)
        if (end !== -1) {
          const latex = remaining.slice(1, end)
          try {
            parts.push(
              katex.renderToString(latex, {
                displayMode: false,
                throwOnError: false,
              })
            )
          } catch {
            parts.push(`<span class="text-destructive">${latex}</span>`)
          }
          remaining = remaining.slice(end + 1)
          continue
        }
      }

      // Check for newlines
      if (remaining.startsWith("\n")) {
        parts.push("<br />")
        remaining = remaining.slice(1)
        continue
      }

      // Regular text - collect until next special character
      let nextSpecial = remaining.length
      const nextDollar = remaining.indexOf("$", 0)
      const nextImg = remaining.indexOf("![", 0)
      const nextNewline = remaining.indexOf("\n", 0)

      if (nextDollar > 0 && nextDollar < nextSpecial) nextSpecial = nextDollar
      if (nextImg > 0 && nextImg < nextSpecial) nextSpecial = nextImg
      if (nextNewline > 0 && nextNewline < nextSpecial)
        nextSpecial = nextNewline

      if (nextSpecial === 0) nextSpecial = 1

      // Escape HTML in the text portion
      const text = remaining.slice(0, nextSpecial)
      parts.push(
        text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      )
      remaining = remaining.slice(nextSpecial)
    }

    return parts.join("")
  }, [content])

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  )
}
