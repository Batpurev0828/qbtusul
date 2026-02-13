"use client"

import { useEffect, useState, useCallback } from "react"
import { Clock, AlertTriangle } from "lucide-react"

interface TestTimerProps {
  durationMinutes: number
  startedAt: Date
  onTimeUp: () => void
}

export function TestTimer({
  durationMinutes,
  startedAt,
  onTimeUp,
}: TestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const elapsed = Math.floor(
      (Date.now() - new Date(startedAt).getTime()) / 1000
    )
    return Math.max(0, durationMinutes * 60 - elapsed)
  })

  const handleTimeUp = useCallback(() => {
    onTimeUp()
  }, [onTimeUp])

  useEffect(() => {
    if (secondsLeft <= 0) {
      handleTimeUp()
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsLeft, handleTimeUp])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isLow = secondsLeft < 300 // less than 5 minutes
  const isCritical = secondsLeft < 60 // less than 1 minute

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold transition-colors ${
        isCritical
          ? "bg-destructive text-destructive-foreground animate-pulse"
          : isLow
            ? "bg-yellow-100 text-yellow-800"
            : "bg-muted text-foreground"
      }`}
    >
      {isLow ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  )
}
