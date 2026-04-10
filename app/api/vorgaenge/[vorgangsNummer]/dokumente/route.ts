/**
 * /api/vorgaenge/[vorgangsNummer]/dokumente – proxy for one-shot document upload.
 *
 * The upload component POSTs files here so the browser never needs the
 * Cloudflare Worker URL.  The Worker creates the D1 slot and stores the
 * file in R2 atomically.
 */

import { NextResponse } from "next/server"

const WORKER =
  (process.env.MCP_API_URL ?? process.env.NEXT_PUBLIC_MCP_API_URL ?? "http://localhost:8787")
    .replace(/\/$/, "")

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vorgangsNummer: string }> },
) {
  const { vorgangsNummer } = await params
  try {
    const formData = await request.formData()
    const res = await fetch(
      `${WORKER}/api/vorgaenge/${encodeURIComponent(vorgangsNummer)}/dokumente`,
      { method: "POST", body: formData },
    )
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("[/api/vorgaenge/[nr]/dokumente POST]", err)
    return NextResponse.json({ error: "Upload fehlgeschlagen – Worker nicht erreichbar" }, { status: 502 })
  }
}
