import { NextResponse } from "next/server"
import type { Project, Station, UploadedFile } from "@/lib/types"

// Shared storage with parent route (in production, use a database)
// This is a simplified example - in production you'd use a proper database
let projects: Project[] = []

// Helper to get projects from parent route's memory
// In production, this would be a database query
async function getProjects(): Promise<Project[]> {
  // Fetch from the main route to get shared state
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000"
  
  try {
    const response = await fetch(`${baseUrl}/api/projects`, { 
      cache: "no-store",
      headers: { "x-internal-request": "true" }
    })
    const data = await response.json()
    return data.projects || []
  } catch {
    return projects
  }
}

// GET - Einzelnes Projekt abrufen
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const allProjects = await getProjects()
  const project = allProjects.find(p => p.id === id)

  if (!project) {
    return NextResponse.json(
      { error: "Projekt nicht gefunden" },
      { status: 404 }
    )
  }

  return NextResponse.json({ project })
}

// PATCH - Projekt oder Station aktualisieren
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const body = await request.json()
    const allProjects = await getProjects()
    const projectIndex = allProjects.findIndex(p => p.id === id)

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: "Projekt nicht gefunden" },
        { status: 404 }
      )
    }

    const project = allProjects[projectIndex]

    // Station-Update
    if (body.stationId && body.update) {
      const stationIndex = project.stations.findIndex(s => s.id === body.stationId)
      if (stationIndex === -1) {
        return NextResponse.json(
          { error: "Station nicht gefunden" },
          { status: 404 }
        )
      }

      const station = project.stations[stationIndex]
      
      // Status aktualisieren
      if (body.update.status) {
        station.status = body.update.status as Station["status"]
      }

      // Datei-Upload
      if (body.update.uploadedFile) {
        station.uploadedFile = {
          name: body.update.uploadedFile.name,
          uploadedAt: new Date(),
          status: body.update.uploadedFile.status || "checking",
          feedback: body.update.uploadedFile.feedback,
        } as UploadedFile

        // Automatisch Status anpassen
        if (station.uploadedFile.status === "approved") {
          station.status = "completed"
        } else if (station.uploadedFile.status === "checking" || station.uploadedFile.status === "needs-revision") {
          station.status = "in-progress"
        }
      }

      project.stations[stationIndex] = station
    }

    // Projekt-Metadaten aktualisieren
    if (body.name) project.name = body.name
    if (body.description) project.description = body.description

    allProjects[projectIndex] = project
    projects = allProjects

    return NextResponse.json({ 
      success: true, 
      project,
      message: "Projekt aktualisiert"
    })
  } catch (error) {
    console.error("Fehler beim Aktualisieren:", error)
    return NextResponse.json(
      { error: "Ungültige Anfrage" },
      { status: 400 }
    )
  }
}
