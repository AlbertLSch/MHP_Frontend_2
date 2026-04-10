/**
 * /api/upload/[uploadId] – proxy for the two-step MCP upload flow.
 *
 * Flow:
 *   1. LLM calls get_upload_url → gets upload_id + Worker URL
 *   2. Frontend user POSTs file here (browser never needs Worker URL)
 *   3. LLM calls confirm_upload(upload_id) to verify
 */

import { NextResponse } from "next/server"

const WORKER =
  (process.env.MCP_API_URL ?? process.env.NEXT_PUBLIC_MCP_API_URL ?? "http://localhost:8787")
    .replace(/\/$/, "")

export async function POST(
  request: Request,
  { params }: { params: Promise<{ uploadId: string }> },
) {
  const { uploadId } = await params
  try {
    const formData = await request.formData()
    const res = await fetch(`${WORKER}/api/upload/${encodeURIComponent(uploadId)}`, {
      method: "POST",
      body:   formData,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("[/api/upload/[uploadId] POST]", err)
    return NextResponse.json({ error: "Upload fehlgeschlagen – Worker nicht erreichbar" }, { status: 502 })
  }
}
