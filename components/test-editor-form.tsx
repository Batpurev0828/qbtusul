"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  QuestionEditor,
  type MCQuestion,
  type FRQuestion,
} from "@/components/question-editor"
import { Plus, Save, Loader2 } from "lucide-react"

interface TestEditorFormProps {
  initialData?: {
    _id?: string
    year: number
    subject: string
    title: string
    timeLimitMinutes: number
    mcQuestions: MCQuestion[]
    frQuestions: FRQuestion[]
    published: boolean
  }
  mode: "create" | "edit"
}

export function TestEditorForm({ initialData, mode }: TestEditorFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [year, setYear] = useState(initialData?.year || new Date().getFullYear())
  const [subject, setSubject] = useState(initialData?.subject || "General")
  const [title, setTitle] = useState(
    initialData?.title || `GEE ${new Date().getFullYear()}`
  )
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    initialData?.timeLimitMinutes || 120
  )
  const [published, setPublished] = useState(initialData?.published || false)
  const [mcQuestions, setMcQuestions] = useState<MCQuestion[]>(
    initialData?.mcQuestions || []
  )
  const [frQuestions, setFrQuestions] = useState<FRQuestion[]>(
    initialData?.frQuestions || []
  )

  const addMCQuestion = () => {
    setMcQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        options: ["", "", "", "", ""],
        correctAnswer: 0,
        points: 1,
        solution: "",
        order: prev.length + 1,
      },
    ])
  }

  const addFRQuestion = () => {
    setFrQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        points: 5,
        solution: "",
        order: prev.length + 1,
      },
    ])
  }

  const updateMC = (index: number, q: MCQuestion | FRQuestion) => {
    setMcQuestions((prev) => prev.map((old, i) => (i === index ? (q as MCQuestion) : old)))
  }

  const removeMC = (index: number) => {
    setMcQuestions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order: i + 1 }))
    )
  }

  const moveMC = (index: number, direction: "up" | "down") => {
    setMcQuestions((prev) => {
      const newArr = [...prev]
      const swapIdx = direction === "up" ? index - 1 : index + 1
      if (swapIdx < 0 || swapIdx >= newArr.length) return prev
      ;[newArr[index], newArr[swapIdx]] = [newArr[swapIdx], newArr[index]]
      return newArr.map((q, i) => ({ ...q, order: i + 1 }))
    })
  }

  const updateFR = (index: number, q: MCQuestion | FRQuestion) => {
    setFrQuestions((prev) => prev.map((old, i) => (i === index ? (q as FRQuestion) : old)))
  }

  const removeFR = (index: number) => {
    setFrQuestions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order: i + 1 }))
    )
  }

  const moveFR = (index: number, direction: "up" | "down") => {
    setFrQuestions((prev) => {
      const newArr = [...prev]
      const swapIdx = direction === "up" ? index - 1 : index + 1
      if (swapIdx < 0 || swapIdx >= newArr.length) return prev
      ;[newArr[index], newArr[swapIdx]] = [newArr[swapIdx], newArr[index]]
      return newArr.map((q, i) => ({ ...q, order: i + 1 }))
    })
  }

  const handleSave = async () => {
    setError("")
    setSaving(true)

    const payload = {
      year,
      subject,
      title,
      timeLimitMinutes,
      published,
      mcQuestions,
      frQuestions,
    }

    try {
      const url =
        mode === "create"
          ? "/api/tests"
          : `/api/tests/${initialData?._id}`
      const method = mode === "create" ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save test")
      }

      router.push("/admin")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const totalMCPoints = mcQuestions.reduce((s, q) => s + q.points, 0)
  const totalFRPoints = frQuestions.reduce((s, q) => s + q.points, 0)

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Test metadata */}
      <section className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Test Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
              className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Time limit (minutes)
            </label>
            <input
              type="number"
              min={1}
              value={timeLimitMinutes}
              onChange={(e) =>
                setTimeLimitMinutes(parseInt(e.target.value) || 120)
              }
              className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
          />
          <label htmlFor="published" className="text-sm text-foreground">
            Published (visible to students)
          </label>
        </div>
      </section>

      {/* MC Questions */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Multiple Choice Questions{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({mcQuestions.length} questions, {totalMCPoints} pts)
            </span>
          </h2>
          <button
            type="button"
            onClick={addMCQuestion}
            className="inline-flex items-center gap-1.5 h-9 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add MC
          </button>
        </div>
        {mcQuestions.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No multiple choice questions yet. Click "Add MC" to get started.
          </p>
        )}
        {mcQuestions.map((q, i) => (
          <QuestionEditor
            key={i}
            type="mc"
            question={q}
            index={i}
            total={mcQuestions.length}
            onUpdate={(updated) => updateMC(i, updated)}
            onRemove={() => removeMC(i)}
            onMoveUp={() => moveMC(i, "up")}
            onMoveDown={() => moveMC(i, "down")}
          />
        ))}
      </section>

      {/* FR Questions */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Free Response Questions{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({frQuestions.length} questions, {totalFRPoints} pts)
            </span>
          </h2>
          <button
            type="button"
            onClick={addFRQuestion}
            className="inline-flex items-center gap-1.5 h-9 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add FR
          </button>
        </div>
        {frQuestions.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No free response questions yet. Click "Add FR" to get started.
          </p>
        )}
        {frQuestions.map((q, i) => (
          <QuestionEditor
            key={i}
            type="fr"
            question={q}
            index={i}
            total={frQuestions.length}
            onUpdate={(updated) => updateFR(i, updated)}
            onRemove={() => removeFR(i)}
            onMoveUp={() => moveFR(i, "up")}
            onMoveDown={() => moveFR(i, "down")}
          />
        ))}
      </section>

      {/* Summary + Save */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border px-4 py-4 -mx-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total: {mcQuestions.length + frQuestions.length} questions,{" "}
          {totalMCPoints + totalFRPoints} points
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : mode === "create" ? "Create Test" : "Save Changes"}
        </button>
      </div>
    </div>
  )
}
