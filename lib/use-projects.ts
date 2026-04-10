"use client"

import useSWR from "swr"

import type { Project } from "./types"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<{ projects: Project[] }>(
    "/api/projects",
    fetcher,
    { refreshInterval: 3000 } // Polling alle 3 Sekunden für neue Projekte
  )

  return {
    projects: data?.projects || [],
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useProject(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ project: Project }>(
    id ? `/api/projects/${id}` : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  return {
    project: data?.project || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

// Upload-Funktion für Dokumente
export async function uploadDocument(
  projectId: string,
  stationId: string,
  file: File
): Promise<{
  success: boolean
  checkResult?: {
    status: "approved" | "needs-revision"
    feedback: string
    issues?: string[]
    suggestions?: string[]
  }
  error?: string
}> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("stationId", stationId)

  try {
    const response = await fetch(`/api/projects/${projectId}/upload`, {
      method: "POST",
      body: formData,
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.error }
    }

    return { success: true, checkResult: data.checkResult }
  } catch (error) {
    return { success: false, error: "Upload fehlgeschlagen" }
  }
}

// Station-Status aktualisieren
export async function updateStationStatus(
  projectId: string,
  stationId: string,
  update: {
    status?: "pending" | "in-progress" | "completed"
    uploadedFile?: {
      name: string
      status: "checking" | "approved" | "needs-revision"
      feedback?: string
    }
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId, update }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.error }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Aktualisierung fehlgeschlagen" }
  }
}
