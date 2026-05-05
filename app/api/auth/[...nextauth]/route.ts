import { auth, handlers as authHandlers } from "@/auth"
import { NextResponse } from "next/server"

// Safely export handlers — during build or if auth is not configured, provide fallbacks
const fallbackHandler = () => NextResponse.json({ error: "Auth not configured" }, { status: 503 })

export const GET = authHandlers?.GET ?? fallbackHandler
export const POST = authHandlers?.POST ?? fallbackHandler
