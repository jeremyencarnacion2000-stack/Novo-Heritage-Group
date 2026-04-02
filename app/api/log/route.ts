import { NextResponse } from "next/server"

const ALLOWED_LEVELS = new Set(["info", "warn", "error"] as const)

interface ClientLogPayload {
  level?: "info" | "warn" | "error"
  message: string
  context?: Record<string, unknown> | null
}

export async function POST(req: Request) {
  try {
    const body: ClientLogPayload | null = await req.json()

    if (!body || typeof body.message !== "string" || body.message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const level = body.level && ALLOWED_LEVELS.has(body.level) ? body.level : "info"
    const logEntry = {
      level,
      message: body.message.trim(),
      context: body.context ?? null,
      timestamp: new Date().toISOString(),
    }

    switch (level) {
      case "error":
        console.error("[client-log]", logEntry)
        break
      case "warn":
        console.warn("[client-log]", logEntry)
        break
      default:
        console.log("[client-log]", logEntry)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[api/log] Failed to process log", error)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}
