"use client"

import { useState, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"

const WORKER_URL = "https://bauordnungsamt-muenster-mcp.thorin-dugajczyk.workers.dev"

type UploadState =
  | { type: "idle" }
  | { type: "uploading" }
  | { type: "success"; filename: string; message: string; documentType: string }
  | { type: "error_not_found" }
  | { type: "error_conflict" }
  | { type: "error_no_file" }
  | { type: "error_unknown"; message: string }

export default function UploadPage() {
  const params = useParams()
  const uploadId = Array.isArray(params.id) ? params.id[0] : params.id

  const [state, setState] = useState<UploadState>({ type: "idle" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File | null) => {
    if (!file) return
    setSelectedFile(file)
    setState({ type: "idle" })
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileChange(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) return

    setState({ type: "uploading" })

    // Datei unter der Upload-ID speichern, Extension beibehalten
    const ext = selectedFile.name.includes(".")
      ? "." + selectedFile.name.split(".").pop()
      : ""
    const renamedFile = new File([selectedFile], `${uploadId}${ext}`, {
      type: selectedFile.type,
    })

    const formData = new FormData()
    formData.append("file", renamedFile)

    try {
      const res = await fetch(`${WORKER_URL}/api/upload/${uploadId}`, {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setState({
          type: "success",
          filename: data.filename,
          message: data.message,
          documentType: data.document_type,
        })
        return
      }

      switch (res.status) {
        case 404:
          setState({ type: "error_not_found" })
          break
        case 409:
          setState({ type: "error_conflict" })
          break
        case 400:
          setState({ type: "error_no_file" })
          break
        default:
          setState({ type: "error_unknown", message: `Fehler ${res.status}` })
      }
    } catch {
      setState({ type: "error_unknown", message: "Verbindung zum Server fehlgeschlagen." })
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-md mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded bg-[#003366] flex items-center justify-center">
            <span className="text-white text-xs font-bold">MS</span>
          </div>
          <span className="text-sm font-medium text-[#003366]">Bauordnungsamt Münster</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mt-4">Dokument hochladen</h1>
        <p className="text-sm text-gray-500 mt-1">
          Laden Sie das angeforderte Dokument sicher hoch.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Upload ID */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Upload-ID</p>
          <p className="text-sm font-mono text-gray-800 break-all">{uploadId}</p>
        </div>

        <div className="p-6">
          {state.type === "success" ? (
            <SuccessView filename={state.filename} message={state.message} documentType={state.documentType} />
          ) : state.type === "error_not_found" ? (
            <ErrorView
              icon={<XCircle className="w-10 h-10 text-red-500" />}
              title="Upload-Link ungültig"
              description="Dieser Upload-Link existiert nicht oder ist abgelaufen. Bitte kontaktieren Sie das Bauordnungsamt Münster."
            />
          ) : state.type === "error_conflict" ? (
            <ErrorView
              icon={<AlertCircle className="w-10 h-10 text-amber-500" />}
              title="Bereits hochgeladen"
              description="Für diesen Upload-Link wurde bereits ein Dokument eingereicht. Ein erneuter Upload ist nicht möglich."
            />
          ) : (
            <>
              {/* Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-[#003366] bg-blue-50"
                    : selectedFile
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 text-green-500" />
                    <p className="font-medium text-gray-900 text-sm break-all">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(selectedFile.size)}</p>
                    <p className="text-xs text-[#003366] mt-1">Andere Datei wählen</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-gray-300" />
                    <p className="font-medium text-gray-700 text-sm">Datei hierher ziehen</p>
                    <p className="text-xs text-gray-400">oder klicken zum Auswählen</p>
                  </div>
                )}
              </div>

              {/* Error inline */}
              {(state.type === "error_no_file" || state.type === "error_unknown") && (
                <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    {state.type === "error_no_file"
                      ? "Kein Dokument ausgewählt."
                      : state.message}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || state.type === "uploading"}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#003366] text-white text-sm font-medium py-3 px-4 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
              >
                {state.type === "uploading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Wird hochgeladen…
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Dokument einreichen
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
        Ihre Daten werden sicher übertragen und ausschließlich vom Bauordnungsamt Münster verwendet.
      </p>
    </div>
  )
}

function SuccessView({
  filename,
  message,
  documentType,
}: {
  filename: string
  message: string
  documentType: string
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-4">
      <CheckCircle2 className="w-14 h-14 text-green-500" />
      <h2 className="text-lg font-semibold text-gray-900">Erfolgreich eingereicht</h2>
      <p className="text-sm text-gray-600">{message}</p>
      <div className="mt-2 w-full rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-left space-y-1">
        <Row label="Dateiname" value={filename} />
        <Row label="Dokumenttyp" value={documentType} />
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Sie können dieses Fenster jetzt schließen.
      </p>
    </div>
  )
}

function ErrorView({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-4">
      {icon}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-700 font-medium text-right break-all">{value}</span>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
