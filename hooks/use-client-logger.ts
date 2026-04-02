"use client"

import { useCallback } from "react"

type LogLevel = "info" | "warn" | "error"

interface ClientLogPayload {
  level?: LogLevel
  message: string
  context?: Record<string, unknown>
}

export function useClientLogger() {
  const log = useCallback(async ({ level = "info", message, context }: ClientLogPayload) => {
    try {
      await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ level, message, context }),
      })
    } catch (error) {
      console.error("[client-log] Failed to send log", error)
    }
  }, [])

  return { log }
}
