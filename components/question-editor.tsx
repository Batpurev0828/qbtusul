"use client"

import { useState, useCallback } from "react"
import { KaTeXRenderer } from "@/components/katex-renderer"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import {
  ImagePlus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  X,
} from "lucide-react"

const SLOT_SYMBOL_OPTIONS = [
  "-",
  "+",
  ".",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
] as const

function normalizeSlotLetters(raw: string): string[] {
  const seen = new Set<string>()
  const letters: string[] = []
  for (const ch of raw.toLowerCase()) {
    if (ch < "a" || ch > "h" || seen.has(ch)) continue
    seen.add(ch)
    letters.push(ch)
    if (letters.length >= 8) break
  }
  return letters
}

function buildSlotAnswer(letters: string[], choices: string[]): string {
  return letters.map((_, i) => choices[i] || "").join("")
}

export interface MCQuestion {
  questionText: string
  description: string
  options: string[]
  correctAnswer: number
  points: number
  solution: string
  order: number
}

export interface FRQuestion {
  questionText: string
  description: string
  answerMode?: "text" | "slot"
  slotLetters?: string[]
  slotCorrectChoices?: string[]
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [showSolutionPreview, setShowSolutionPreview] = useState(true)
  const [showChoicesPreview, setShowChoicesPreview] = useState(true)
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
  const frQ = type === "fr" ? (question as FRQuestion) : null
  const questionPreview = (question.questionText || "").trim()

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
            title={isCollapsed ? "Expand question" : "Collapse question"}
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
            />
          </button>
          <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            {type === "mc" ? "MC" : "FR"} #{index + 1}
          </span>
          <span className="text-sm text-muted-foreground">
            Order: {question.order}
          </span>
          <div className="flex items-center gap-2">
            <label
              htmlFor={`points-${type}-${index}`}
              className="text-sm text-muted-foreground"
            >
              Points:
            </label>
            <input
              id={`points-${type}-${index}`}
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

      {isCollapsed && (
        <p className="text-sm text-muted-foreground truncate">
          {questionPreview || "No question text yet"}
        </p>
      )}

      {!isCollapsed && (
        <>
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
            <div className={`grid gap-3 ${showPreview ? "md:grid-cols-2" : ""}`}>
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
          </div>

          {/* Question description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Description{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={question.description || ""}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  description: e.target.value,
                } as MCQuestion | FRQuestion)
              }
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
              placeholder="Extra context for students (shown while taking the test)."
            />
          </div>

          {/* MC-specific: options and correct answer */}
          {type === "mc" && mcQ && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Options
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChoicesPreview(!showChoicesPreview)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                    title={
                      showChoicesPreview ? "Hide choices preview" : "Show choices preview"
                    }
                  >
                    {showChoicesPreview ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
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
              </div>
              {mcQ.options.map((opt, oi) => (
                <div key={oi} className="flex items-start gap-2">
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
                  <div
                    className={`flex-1 grid gap-2 ${showChoicesPreview ? "md:grid-cols-2" : ""}`}
                  >
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...mcQ.options]
                        newOpts[oi] = e.target.value
                        onUpdate({ ...mcQ, options: newOpts } as MCQuestion)
                      }}
                      className="w-full h-8 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    />
                    {showChoicesPreview && (
                      <div className="min-h-8 border border-border rounded-md px-2 py-1 bg-muted/30">
                        <MarkdownRenderer
                          content={opt}
                          className="text-sm text-foreground leading-relaxed"
                        />
                      </div>
                    )}
                  </div>
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

          {/* Solution */}
          {type === "fr" && frQ && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Answer Type
              </label>
              <select
                value={frQ.answerMode || "text"}
                onChange={(e) => {
                  const nextMode = e.target.value as "text" | "slot"
                  if (nextMode === "slot") {
                    const slotLetters = frQ.slotLetters?.length
                      ? frQ.slotLetters
                      : ["a", "b", "c", "d"]
                    const slotCorrectChoices = slotLetters.map(
                      (_, i) => frQ.slotCorrectChoices?.[i] || ""
                    )
                    onUpdate({
                      ...frQ,
                      answerMode: "slot",
                      slotLetters,
                      slotCorrectChoices,
                      correctAnswer: buildSlotAnswer(slotLetters, slotCorrectChoices),
                    })
                    return
                  }
                  onUpdate({
                    ...frQ,
                    answerMode: "text",
                  })
                }}
                className="h-9 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="text">Text exact match</option>
                <option value="slot">Задгай даалгавар (a-h letters)</option>
              </select>

              {(frQ.answerMode || "text") === "slot" ? (
                <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Letters (a-h)
                    </label>
                    <input
                      type="text"
                      value={(frQ.slotLetters || []).join("")}
                      onChange={(e) => {
                        const slotLetters = normalizeSlotLetters(e.target.value)
                        const slotCorrectChoices = slotLetters.map(
                          (_, i) => frQ.slotCorrectChoices?.[i] || ""
                        )
                        onUpdate({
                          ...frQ,
                          answerMode: "slot",
                          slotLetters,
                          slotCorrectChoices,
                          correctAnswer: buildSlotAnswer(slotLetters, slotCorrectChoices),
                        })
                      }}
                      className="h-9 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                      placeholder="e.g. abcd"
                    />
                    <p className="text-xs text-muted-foreground">
                      Each letter maps to one symbol (sign, digit, decimal point).
                    </p>
                  </div>

                  {(frQ.slotLetters || []).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(frQ.slotLetters || []).map((letter, i) => (
                        <label
                          key={`${letter}-${i}`}
                          className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {letter}
                          </span>
                          <select
                            value={frQ.slotCorrectChoices?.[i] || ""}
                            onChange={(e) => {
                              const slotLetters = frQ.slotLetters || []
                              const slotCorrectChoices = slotLetters.map(
                                (_, idx) =>
                                  idx === i
                                    ? e.target.value
                                    : frQ.slotCorrectChoices?.[idx] || ""
                              )
                              onUpdate({
                                ...frQ,
                                answerMode: "slot",
                                slotLetters,
                                slotCorrectChoices,
                                correctAnswer: buildSlotAnswer(
                                  slotLetters,
                                  slotCorrectChoices
                                ),
                              })
                            }}
                            className="h-8 w-24 px-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                          >
                            <option value="">-</option>
                            {SLOT_SYMBOL_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Enter at least one letter between a and h.
                    </p>
                  )}

                  <div className="text-sm">
                    <span className="text-muted-foreground">Correct answer: </span>
                    <span className="font-mono text-foreground">
                      {buildSlotAnswer(
                        frQ.slotLetters || [],
                        frQ.slotCorrectChoices || []
                      ) || "(empty)"}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <label className="text-sm font-medium text-foreground">
                    Correct Answer
                  </label>
                  <textarea
                    value={frQ.correctAnswer || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...frQ,
                        correctAnswer: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
                    placeholder="Exact-match answer used for automatic FR grading."
                  />
                </>
              )}
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
            <div className={`grid gap-3 ${showSolutionPreview ? "md:grid-cols-2" : ""}`}>
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
              {showSolutionPreview && (
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
        </>
      )}
    </div>
  )
}
