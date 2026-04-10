"use client"

import { useState } from "react"
import { Building2, Clock, FolderOpen, RefreshCw, Loader2, ExternalLink, Check, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useProjects } from "@/lib/use-projects"
import type { Project } from "@/lib/types"
import { ProjectRoadmapView } from "./project-roadmap-view"

const projectTypeLabels: Record<string, string> = {
  baugenehmigung: "Baugenehmigung",
  nutzungsaenderung: "Nutzungsänderung",
  abgeschlossenheit: "Abgeschlossenheitsbescheinigung",
  bauvoranfrage: "Bauvoranfrage",
  abbruch: "Abbruch",
  werbeanlage: "Werbeanlage",
}

function EmptyState() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Building2 className="h-10 w-10" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Kein Bauprojekt vorhanden
        </h2>
        <p className="mb-6 max-w-md text-muted-foreground">
          Starten Sie ein neues Bauprojekt in ChatGPT mit dem Bauordnungsamt-Addon. 
          Die erstellte Roadmap wird automatisch hier angezeigt.
        </p>
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Sagen Sie z.B.: &ldquo;Ich möchte eine Garage bauen&rdquo;
            </span>
          </div>
          <a 
            href="https://chat.openai.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            ChatGPT öffnen
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectCard({ 
  project, 
  onSelect,
  isSelected 
}: { 
  project: Project
  onSelect: () => void
  isSelected: boolean
}) {
  const completedCount = project.stations.filter(s => s.status === "completed").length
  const progress = (completedCount / project.stations.length) * 100

  return (
    <Card 
      className={`cursor-pointer border-border bg-card transition-all hover:border-primary/50 ${
        isSelected ? "border-primary ring-1 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-card-foreground">{project.name}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {projectTypeLabels[project.type] || project.type}
              </CardDescription>
            </div>
          </div>
          {progress === 100 ? (
            <Badge className="bg-primary text-primary-foreground">
              <Check className="mr-1 h-3 w-3" />
              Abgeschlossen
            </Badge>
          ) : (
            <Badge variant="outline" className="border-border text-muted-foreground">
              {completedCount}/{project.stations.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="text-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {project.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Erstellt am {new Date(project.createdAt).toLocaleDateString("de-DE")}
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { projects, isLoading, refresh } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  // Auto-select first project if none selected
  if (projects.length > 0 && !selectedProjectId) {
    setSelectedProjectId(projects[0].id)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Bauprojekt Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Bauordnungsamt Münster
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
              <div className={`h-2 w-2 rounded-full ${projects.length > 0 ? "bg-primary" : "bg-muted-foreground"}`} />
              <span className="text-sm text-muted-foreground">
                {projects.length} Projekt{projects.length !== 1 ? "e" : ""}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Aktualisieren
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Project List */}
            <div className="space-y-4 lg:col-span-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Ihre Projekte</h2>
              </div>
              <div className="space-y-3">
                {projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProjectId === project.id}
                    onSelect={() => setSelectedProjectId(project.id)}
                  />
                ))}
              </div>
            </div>

            {/* Project Roadmap */}
            <div className="lg:col-span-8">
              {selectedProject ? (
                <ProjectRoadmapView project={selectedProject} onRefresh={refresh} />
              ) : (
                <Card className="border-border bg-card">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <FileText className="h-8 w-8" />
                    </div>
                    <h3 className="font-medium text-card-foreground">
                      Projekt auswählen
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Wählen Sie ein Projekt aus der Liste, um die Roadmap zu sehen
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
