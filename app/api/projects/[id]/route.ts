/**
 * /api/projects/[id] – proxy to Cloudflare Worker (D1-backed).
 * The [id] segment is the vorgangs_nummer (e.g. "ABG-2026-12345").
 */

import { NextResponse } from "next/server"

const WORKER =
  (process.env.MCP_API_URL ?? process.env.NEXT_PUBLIC_MCP_API_URL ?? "http://localhost:8787")
    .replace(/\/$/, "")

// GET – fetch single project
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const res  = await fetch(`${WORKER}/api/projects/${encodeURIComponent(id)}`, { cache: "no-store" })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("[/api/projects/[id] GET]", err)
    return NextResponse.json({ error: "Worker nicht erreichbar" }, { status: 502 })
  }
}

// PATCH – update station status / uploaded file
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const body = await request.json()
    const res  = await fetch(`${WORKER}/api/projects/${encodeURIComponent(id)}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("[/api/projects/[id] PATCH]", err)
    return NextResponse.json({ error: "Worker nicht erreichbar" }, { status: 502 })
  }
}
