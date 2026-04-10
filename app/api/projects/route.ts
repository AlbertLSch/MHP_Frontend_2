import { NextResponse } from "next/server"
import type { Project } from "@/lib/types"

// In-memory storage (in production, use a database)
let projects: Project[] = []

// GET - Alle Projekte abrufen
export async function GET() {
  return NextResponse.json({ projects })
}

// POST - Neues Projekt vom MCP Server empfangen
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validierung
    if (!body.name || !body.type || !body.stations) {
      return NextResponse.json(
        { error: "Fehlende Pflichtfelder: name, type, stations" },
        { status: 400 }
      )
    }

    const newProject: Project = {
      id: body.id || crypto.randomUUID(),
      name: body.name,
      description: body.description || "",
      type: body.type,
      createdAt: new Date(),
      vorgangs_nummer: body.vorgangs_nummer || undefined,
      stations: body.stations.map((station: Partial<Project["stations"][0]>, index: number) => ({
        id: station.id || `station-${index + 1}`,
        title: station.title || `Station ${index + 1}`,
        description: station.description || "",
        documents: station.documents || [],
        status: station.status || "pending",
        uploadedFile: station.uploadedFile || undefined,
      })),
    }

    // Bestehendes Projekt mit gleicher ID ersetzen oder neues hinzufügen
    const existingIndex = projects.findIndex(p => p.id === newProject.id)
    if (existingIndex >= 0) {
      projects[existingIndex] = newProject
    } else {
      projects.push(newProject)
    }

    return NextResponse.json({ 
      success: true, 
      project: newProject,
      message: "Projekt erfolgreich erstellt/aktualisiert"
    })
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Anfrage:", error)
    return NextResponse.json(
      { error: "Ungültige Anfrage" },
      { status: 400 }
    )
  }
}

// DELETE - Projekt löschen
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("id")

    if (!projectId) {
      return NextResponse.json(
        { error: "Projekt-ID erforderlich" },
        { status: 400 }
      )
    }

    const initialLength = projects.length
    projects = projects.filter(p => p.id !== projectId)

    if (projects.length === initialLength) {
      return NextResponse.json(
        { error: "Projekt nicht gefunden" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Projekt gelöscht" 
    })
  } catch (error) {
    console.error("Fehler beim Löschen:", error)
    return NextResponse.json(
      { error: "Fehler beim Löschen" },
      { status: 500 }
    )
  }
}
