"use client"

import { useState, useCallback } from "react"
import { KaTeXRenderer } from "@/components/katex-renderer"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import {
  ImagePlus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Plus,
  X,
} from "lucide-react"

export interface MCQuestion {
  questionText: string
  options: string[]
  correctAnswer: number
  points: number
  solution: string
  order: number
}

export interface FRQuestion {
  questionText: string
  correctAnswer: string
  points: number
  solution: string
  order: number
}

interface QuestionEditorProps {
  type: "mc" | "fr"
  question: MCQuestion | FRQuestion
  index: number
  total: number
  onUpdate: (question: MCQuestion | FRQuestion) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function QuestionEditor({
  type,
  question,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: QuestionEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showSolutionPreview, setShowSolutionPreview] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = useCallback(
    async (field: "questionText" | "solution") => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        setUploading(true)
        try {
          const formData = new FormData()
          formData.append("file", file)
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })
          const data = await res.json()
          if (data.url) {
            const imgMarkdown = `![${file.name}](${data.url})`
            onUpdate({
              ...question,
              [field]: (question[field] as string) + "\n" + imgMarkdown,
            } as MCQuestion | FRQuestion)
          }
        } catch (err) {
          console.error("Upload failed:", err)
        } finally {
          setUploading(false)
        }
      }
      input.click()
    },
    [question, onUpdate]
  )

  const mcQ = type === "mc" ? (question as MCQuestion) : null

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            {type === "mc" ? "MC" : "FR"} #{index + 1}
          </span>
          <span className="text-sm text-muted-foreground">
            Order: {question.order}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted disabled:opacity-30"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted disabled:opacity-30"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted"
            title="Remove question"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Points */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground">Points:</label>
        <input
          type="number"
          min={1}
          value={question.points}
          onChange={(e) =>
            onUpdate({
              ...question,
              points: parseInt(e.target.value) || 1,
            } as MCQuestion | FRQuestion)
          }
          className="h-8 w-20 px-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Question text */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Question text{" "}
            <span className="text-muted-foreground font-normal">
              (LaTeX: $...$, images: ![alt](url))
            </span>
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleImageUpload("questionText")}
              disabled={uploading}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted disabled:opacity-50"
              title="Insert image"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
              title={showPreview ? "Hide preview" : "Show preview"}
            >
              {showPreview ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <textarea
          value={question.questionText}
          onChange={(e) =>
            onUpdate({
              ...question,
              questionText: e.target.value,
            } as MCQuestion | FRQuestion)
          }
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
          placeholder="Enter question text. Use $...$ for inline LaTeX, $$...$$ for display LaTeX."
        />
        {showPreview && (
          <div className="border border-border rounded-lg p-3 bg-muted/30">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Preview:
            </div>
            <MarkdownRenderer
              content={question.questionText}
              className="text-sm text-foreground leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* MC-specific: options and correct answer */}
      {type === "mc" && mcQ && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Options
            </label>
            <button
              type="button"
              onClick={() => {
                const updated = { ...mcQ, options: [...mcQ.options, ""] }
                onUpdate(updated)
              }}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add option
            </button>
          </div>
          {mcQ.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdate({ ...mcQ, correctAnswer: oi } as MCQuestion)
                }
                className={`shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${mcQ.correctAnswer === oi
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                title={`Mark option ${String.fromCharCode(65 + oi)} as correct`}
              >
                {String.fromCharCode(65 + oi)}
              </button>
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...mcQ.options]
                  newOpts[oi] = e.target.value
                  onUpdate({ ...mcQ, options: newOpts } as MCQuestion)
                }}
                className="flex-1 h-8 px-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={`Option ${String.fromCharCode(65 + oi)}`}
              />
              {mcQ.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => {
                    const newOpts = mcQ.options.filter((_, i) => i !== oi)
                    const newCorrect =
                      mcQ.correctAnswer >= newOpts.length
                        ? newOpts.length - 1
                        : mcQ.correctAnswer > oi
                          ? mcQ.correctAnswer - 1
                          : mcQ.correctAnswer
                    onUpdate({
                      ...mcQ,
                      options: newOpts,
                      correctAnswer: newCorrect,
                    } as MCQuestion)
                  }}
                  className="p-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Click the letter circle to mark the correct answer. Currently
            correct:{" "}
            <strong>{String.fromCharCode(65 + mcQ.correctAnswer)}</strong>
          </p>
        </div>
      )}

      {/* FR-specific: correct answer */}
      {type === "fr" && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            Correct Answer{" "}
            <span className="text-muted-foreground font-normal">
              (for auto-grading)
            </span>
          </label>
          <input
            type="text"
            value={(question as FRQuestion).correctAnswer || ""}
            onChange={(e) =>
              onUpdate({
                ...question,
                correctAnswer: e.target.value,
              } as FRQuestion)
            }
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter the exact correct answer for auto-grading (case-sensitive)"
          />
          <p className="text-xs text-muted-foreground">
            Student's answer must exactly match this text to receive full points. Leave empty to skip auto-grading.
          </p>
        </div>
      )}

      {/* Solution */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Solution{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleImageUpload("solution")}
              disabled={uploading}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted disabled:opacity-50"
              title="Insert image into solution"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowSolutionPreview(!showSolutionPreview)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
              title={
                showSolutionPreview ? "Hide preview" : "Show solution preview"
              }
            >
              {showSolutionPreview ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <textarea
          value={question.solution}
          onChange={(e) =>
            onUpdate({
              ...question,
              solution: e.target.value,
            } as MCQuestion | FRQuestion)
          }
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
          placeholder="Enter solution (supports LaTeX and images)."
        />
        {showSolutionPreview && question.solution && (
          <div className="border border-border rounded-lg p-3 bg-muted/30">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Solution preview:
            </div>
            <MarkdownRenderer
              content={question.solution}
              className="text-sm text-foreground leading-relaxed"
            />

          </div>
        )}
      </div>
    </div>
  )
}
