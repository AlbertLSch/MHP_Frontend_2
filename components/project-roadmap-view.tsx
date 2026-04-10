"use client"

import { useState, useRef } from "react"
import {
  Check, ChevronRight, Circle, Clock, FileText, Upload,
  AlertCircle, Loader2, ExternalLink, X, CheckCircle2, Copy, Link2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Project, Station, McpUploadResult } from "@/lib/types"
import { uploadDocument, updateStationStatus } from "@/lib/use-projects"
import { mcpUploadDocument, inferDocumentType } from "@/lib/mcp-upload"

function StationIcon({ status }: { status: Station["status"] }) {
  if (status === "completed") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-4 w-4" />
      </div>
    )
  }
  if (status === "in-progress") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/20 text-primary">
        <Clock className="h-4 w-4" />
      </div>
    )
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-secondary text-muted-foreground">
      <Circle className="h-3 w-3" />
    </div>
  )
}

function StationStatusBadge({ status, uploadStatus }: { status: Station["status"]; uploadStatus?: string }) {
  if (uploadStatus === "checking") {
    return (
      <Badge variant="outline" className="border-[oklch(0.80_0.15_85)] bg-[oklch(0.80_0.15_85)]/10 text-[oklch(0.80_0.15_85)]">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        Wird geprüft
      </Badge>
    )
  }
  if (uploadStatus === "approved") {
    return (
      <Badge variant="outline" className="border-primary bg-primary/10 text-primary">
        <Check className="mr-1 h-3 w-3" />
        Genehmigt
      </Badge>
    )
  }
  if (uploadStatus === "needs-revision") {
    return (
      <Badge variant="outline" className="border-destructive bg-destructive/10 text-destructive">
        <AlertCircle className="mr-1 h-3 w-3" />
        Überarbeitung nötig
      </Badge>
    )
  }
  if (status === "completed") {
    return (
      <Badge variant="outline" className="border-primary bg-primary/10 text-primary">
        <Check className="mr-1 h-3 w-3" />
        Abgeschlossen
      </Badge>
    )
  }
  if (status === "in-progress") {
    return (
      <Badge variant="outline" className="border-[oklch(0.80_0.15_85)] bg-[oklch(0.80_0.15_85)]/10 text-[oklch(0.80_0.15_85)]">
        <Clock className="mr-1 h-3 w-3" />
        In Bearbeitung
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-border bg-secondary text-muted-foreground">
      Ausstehend
    </Badge>
  )
}

interface StationDetailPanelProps {
  station: Station
  projectId: string
  /** Wenn gesetzt, wird die Datei direkt an den MCP Worker hochgeladen (echter Upload). */
  vorgangs_nummer?: string
  onClose: () => void
  onRefresh: () => void
}

function StationDetailPanel({
  station,
  projectId,
  vorgangs_nummer,
  onClose,
  onRefresh,
}: StationDetailPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Ergebnis des simulierten Checks (Fallback ohne vorgangs_nummer)
  const [simulatedResult, setSimulatedResult] = useState<{
    status: "approved" | "needs-revision"
    feedback: string
    issues?: string[]
    suggestions?: string[]
  } | null>(null)

  // Ergebnis des echten MCP-Worker-Uploads
  const [mcpResult, setMcpResult] = useState<McpUploadResult | null>(null)

  const copyUploadId = async (id: string) => {
    await navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset input so the same file can be re-selected after an error
    event.target.value = ''

    setIsUploading(true)
    setSimulatedResult(null)
    setMcpResult(null)

    if (vorgangs_nummer) {
      // ── Echter Upload → MCP Worker ──────────────────────────────────────
      const docType = inferDocumentType(
        station.documents[0]?.name ?? station.title
      )
      const result = await mcpUploadDocument(vorgangs_nummer, file, docType)
      setMcpResult(result)

      // Lokalen Projekt-Status auch aktualisieren
      await updateStationStatus(projectId, station.id, {
        uploadedFile: {
          name:     file.name,
          status:   result.status === 'hochgeladen' ? 'approved' : 'needs-revision',
          feedback: result.message,
        },
      })
      onRefresh()
    } else {
      // ── Simulierter Check (kein vorgangs_nummer vorhanden) ───────────────
      await updateStationStatus(projectId, station.id, {
        uploadedFile: { name: file.name, status: 'checking' },
      })
      onRefresh()

      const result = await uploadDocument(projectId, station.id, file)
      if (result.success && result.checkResult) {
        setSimulatedResult(result.checkResult)
        await updateStationStatus(projectId, station.id, {
          uploadedFile: {
            name:     file.name,
            status:   result.checkResult.status,
            feedback: result.checkResult.feedback,
          },
        })
        onRefresh()
      }
    }

    setIsUploading(false)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-card-foreground">{station.title}</CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              {station.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Benötigte Dokumente */}
        {station.documents.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-medium text-foreground">
              Benötigte Dokumente
            </h4>
            <div className="space-y-2">
              {station.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.description}</p>
                    </div>
                  </div>
                  {doc.link && (
                    <a
                      href={doc.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Formular
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload-Bereich */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              Dokument hochladen
            </h4>
            {vorgangs_nummer && (
              <div className="flex items-center gap-1 text-xs text-primary">
                <Link2 className="h-3 w-3" />
                <span>Vorgang {vorgangs_nummer}</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {vorgangs_nummer ? "Wird hochgeladen…" : "Wird geprüft…"}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Dokument hochladen
              </>
            )}
          </Button>
          {!vorgangs_nummer && (
            <p className="mt-2 text-xs text-muted-foreground">
              Kein Vorgang verknüpft – simulierter Dokumentencheck aktiv.
            </p>
          )}
        </div>

        {/* ── MCP Worker Upload-Ergebnis ──────────────────────────────── */}
        {mcpResult && (
          <div className={`rounded-lg border p-4 ${
            mcpResult.status === "hochgeladen"
              ? "border-primary/50 bg-primary/10"
              : "border-destructive/50 bg-destructive/10"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {mcpResult.status === "hochgeladen" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-medium text-primary">Dokument eingereicht</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="font-medium text-destructive">Upload fehlgeschlagen</span>
                </>
              )}
            </div>
            <p className="text-sm text-foreground mb-3">{mcpResult.message}</p>

            {mcpResult.status === "hochgeladen" && mcpResult.upload_id && (
              <div className="rounded-md border border-border bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Upload-ID (für KI-Bestätigung via <code className="text-primary">confirm_upload</code>):
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-background px-2 py-1 text-xs font-mono text-foreground break-all">
                    {mcpResult.upload_id}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => copyUploadId(mcpResult.upload_id)}
                  >
                    {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Geben Sie diese ID Ihrem KI-Assistenten, um den Upload zu bestätigen.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Simulierter Check-Status (kein vorgangs_nummer) ─────────── */}
        {station.uploadedFile && !mcpResult && !simulatedResult && (
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{station.uploadedFile.name}</span>
              <StationStatusBadge status={station.status} uploadStatus={station.uploadedFile.status} />
            </div>
            {station.uploadedFile.feedback && (
              <p className="mt-2 text-sm text-muted-foreground">{station.uploadedFile.feedback}</p>
            )}
          </div>
        )}

        {/* ── Simuliertes Prüfungsergebnis ─────────────────────────────── */}
        {simulatedResult && (
          <div className={`rounded-lg border p-4 ${
            simulatedResult.status === "approved"
              ? "border-primary/50 bg-primary/10"
              : "border-destructive/50 bg-destructive/10"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {simulatedResult.status === "approved" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-medium text-primary">Dokument genehmigt</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="font-medium text-destructive">Überarbeitung erforderlich</span>
                </>
              )}
            </div>
            <p className="text-sm text-foreground">{simulatedResult.feedback}</p>

            {simulatedResult.issues && simulatedResult.issues.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-destructive mb-1">Gefundene Probleme:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {simulatedResult.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-destructive">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {simulatedResult.suggestions && simulatedResult.suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-primary mb-1">Verbesserungsvorschläge:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {simulatedResult.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ProjectRoadmapViewProps {
  project: Project
  onRefresh: () => void
}

export function ProjectRoadmapView({ project, onRefresh }: ProjectRoadmapViewProps) {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)

  const completedCount = project.stations.filter((s) => s.status === "completed").length
  const progress = (completedCount / project.stations.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-card-foreground">{project.name}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {completedCount} von {project.stations.length} Stationen abgeschlossen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Station List */}
        <div className="space-y-0">
          {project.stations.map((station, index) => (
            <div key={station.id} className="relative">
              {/* Connector Line */}
              {index < project.stations.length - 1 && (
                <div
                  className={`absolute left-4 top-8 h-full w-0.5 -translate-x-1/2 ${
                    station.status === "completed" ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
              
              {/* Station Card */}
              <Card
                className={`relative cursor-pointer border-border bg-card transition-all hover:border-primary/50 ${
                  selectedStation?.id === station.id ? "border-primary ring-1 ring-primary" : ""
                }`}
                onClick={() => setSelectedStation(station)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <StationIcon status={station.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-card-foreground truncate">
                        {index + 1}. {station.title}
                      </h3>
                      <StationStatusBadge 
                        status={station.status} 
                        uploadStatus={station.uploadedFile?.status}
                      />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                      {station.description}
                    </p>
                    {station.documents.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        {station.documents.length} Dokument{station.documents.length > 1 ? "e" : ""}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
              
              {/* Spacer */}
              {index < project.stations.length - 1 && <div className="h-4" />}
            </div>
          ))}
        </div>

        {/* Station Detail */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {selectedStation ? (
            <StationDetailPanel
              station={selectedStation}
              projectId={project.id}
              vorgangs_nummer={project.vorgangs_nummer}
              onClose={() => setSelectedStation(null)}
              onRefresh={onRefresh}
            />
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="font-medium text-card-foreground">
                  Station auswählen
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Klicken Sie auf eine Station, um Details zu sehen
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
