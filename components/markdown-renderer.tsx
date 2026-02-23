"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

function normalizeDisplayMath(content: string): string {
  return content.replace(
    /(^|\n)([ \t]*)\$\$([^\n]*?)\$\$([ \t]*)(?=\n|$)/g,
    (full, lineStart: string, indent: string, expr: string, trailing: string) => {
      const trimmedExpr = expr.trim()
      if (!trimmedExpr) return full
      return `${lineStart}${indent}$$\n${indent}${trimmedExpr}\n${indent}$$${trailing}`
    }
  )
}

export function MarkdownRenderer({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: ({ ...props }) => (
            <img
              {...props}
              className="max-w-full rounded-lg border border-border my-2"
              alt={props.alt ?? ""}
            />
          ),
          a: ({ ...props }) => (
            <a
              {...props}
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            />
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className
            return isInline ? (
              <code
                {...props}
                className="px-1 py-0.5 rounded bg-muted border border-border text-xs"
              >
                {children}
              </code>
            ) : (
              <pre className="p-3 rounded-lg bg-muted border border-border overflow-x-auto">
                <code {...props}>{children}</code>
              </pre>
            )
          },
        }}
      >
        {normalizeDisplayMath(content)}
      </ReactMarkdown>
    </div>
  )
}
