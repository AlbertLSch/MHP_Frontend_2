/**
 * Upload a file to the MCP Worker via the Next.js proxy route.
 *
 * The browser calls /api/vorgaenge/:nr/dokumente (Next.js),
 * which forwards to the Cloudflare Worker.  This way the Worker URL
 * never needs to be exposed to the browser (no NEXT_PUBLIC_MCP_API_URL needed).
 *
 * The Worker creates the D1 slot and stores the file in R2 atomically.
 * The returned upload_id can be passed to the LLM which then calls
 * confirm_upload(upload_id) to verify.
 */

import type { McpUploadResult } from './types'

/** Map station titles / document names to Worker document_type enum values. */
export function inferDocumentType(hint: string): string {
  const h = hint.toLowerCase()
  if (h.includes('lageplan'))            return 'lageplan'
  if (h.includes('aufteilungsplan'))     return 'aufteilungsplan'
  if (h.includes('grundbuch'))           return 'grundbuchauszug'
  if (h.includes('vollmacht'))           return 'vollmacht'
  if (h.includes('baubeschreibung'))     return 'baubeschreibung'
  if (h.includes('standsicherheit'))     return 'standsicherheitsnachweis'
  if (h.includes('brandschutz'))         return 'brandschutznachweis'
  if (h.includes('betrieb'))             return 'betriebsbeschreibung'
  return 'sonstiges'
}

export async function mcpUploadDocument(
  vorgangs_nummer: string,
  file: File,
  document_type: string = 'sonstiges',
): Promise<McpUploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('document_type', document_type)
  formData.append('filename', file.name)

  // Use relative URL → routed through Next.js proxy (no CORS, no Worker URL in browser)
  const res = await fetch(
    `/api/vorgaenge/${encodeURIComponent(vorgangs_nummer)}/dokumente`,
    { method: 'POST', body: formData },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string }
    return {
      upload_id:       '',
      vorgangs_nummer,
      document_type,
      filename:        file.name,
      status:          'fehler',
      message:         err.error ?? `Upload fehlgeschlagen (HTTP ${res.status})`,
    }
  }

  return res.json() as Promise<McpUploadResult>
}
