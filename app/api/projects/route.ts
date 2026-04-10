/**
 * /api/projects – thin proxy to the Cloudflare Worker (D1-backed).
 *
 * All project data lives in the Worker's D1 database so it survives
 * Vercel cold starts.  The Next.js route just forwards requests and
 * translates responses.
 *
 * Required env var (server-side only, no NEXT_PUBLIC prefix needed):
 *   MCP_API_URL=https://bauordnungsamt-muenster-mcp.<subdomain>.workers.dev
 *
 * Falls back to NEXT_PUBLIC_MCP_API_URL, then localhost:8787.
 */

import { NextResponse } from "next/server"

const WORKER =
  (process.env.MCP_API_URL ?? process.env.NEXT_PUBLIC_MCP_API_URL ?? "http://localhost:8787")
    .replace(/\/$/, "")

// GET – list all projects
export async function GET() {
  try {
    const res  = await fetch(`${WORKER}/api/projects`, { cache: "no-store" })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("[/api/projects GET]", err)
    return NextResponse.json({ projects: [] }, { status: 200 })
  }
}

// POST – create / update project (LLM calls this with roadmap data)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res  = await fetch(`${WORKER}/api/projects`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("[/api/projects POST]", err)
    return NextResponse.json({ error: "Worker nicht erreichbar" }, { status: 502 })
  }
}

// DELETE – no-op for D1 (data stays in Cloudflare; just acknowledge)
export async function DELETE() {
  return NextResponse.json({ success: true, message: "Hinweis: Daten bleiben in D1 erhalten." })
}
