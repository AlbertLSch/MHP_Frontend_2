export interface Document {
  id: string
  name: string
  description: string
  link?: string
  required: boolean
}

export interface Station {
  id: string
  title: string
  description: string
  documents: Document[]
  status: "pending" | "in-progress" | "completed"
  uploadedFile?: UploadedFile
}

export interface UploadedFile {
  name: string
  uploadedAt: Date
  status: "checking" | "approved" | "needs-revision"
  feedback?: string
}

export interface Project {
  id: string
  name: string
  description: string
  type: string
  createdAt: Date
  stations: Station[]
  /** Vorgangsnummer vom MCP-Backend (z. B. "ABG-2026-12345"), gesetzt nach submit_form_to_behoerde */
  vorgangs_nummer?: string
}

/** Ergebnis eines echten MCP-Worker-Uploads */
export interface McpUploadResult {
  upload_id: string
  vorgangs_nummer: string
  document_type: string
  filename: string
  status: 'hochgeladen' | 'fehler'
  message: string
}

export type ProjectType = 
  | "baugenehmigung"
  | "nutzungsaenderung"
  | "abgeschlossenheit"
  | "bauvoranfrage"
  | "abbruch"
  | "werbeanlage"
