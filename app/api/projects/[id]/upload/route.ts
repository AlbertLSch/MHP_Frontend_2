import { NextResponse } from "next/server"

// POST - Datei-Upload für eine Station (simuliert Prüfung)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const stationId = formData.get("stationId") as string | null

    if (!file || !stationId) {
      return NextResponse.json(
        { error: "Datei und Station-ID erforderlich" },
        { status: 400 }
      )
    }

    // Simulierte Dokumentenprüfung
    // In der echten Implementierung würde hier die GPT-Prüfung stattfinden
    const checkResult = await simulateDocumentCheck(file)

    return NextResponse.json({
      success: true,
      projectId: id,
      stationId,
      fileName: file.name,
      fileSize: file.size,
      checkResult,
      message: "Datei hochgeladen und geprüft"
    })
  } catch (error) {
    console.error("Fehler beim Upload:", error)
    return NextResponse.json(
      { error: "Upload fehlgeschlagen" },
      { status: 500 }
    )
  }
}

// Simulierte Dokumentenprüfung
async function simulateDocumentCheck(file: File): Promise<{
  status: "approved" | "needs-revision"
  feedback: string
  issues?: string[]
  suggestions?: string[]
}> {
  // Simulierte Verzögerung für Prüfung
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Zufällig entweder genehmigt oder Überarbeitung nötig
  const isApproved = Math.random() > 0.3

  if (isApproved) {
    return {
      status: "approved",
      feedback: `Das Dokument "${file.name}" wurde geprüft und entspricht den Anforderungen. Alle Pflichtfelder sind korrekt ausgefüllt.`,
    }
  }

  return {
    status: "needs-revision",
    feedback: `Das Dokument "${file.name}" enthält einige Punkte, die überarbeitet werden sollten.`,
    issues: [
      "Unterschrift auf Seite 3 fehlt",
      "Datum im falschen Format (erwartet: TT.MM.JJJJ)",
      "Angabe der Flurstücksnummer unvollständig",
    ],
    suggestions: [
      "Bitte alle markierten Felder vollständig ausfüllen",
      "Das Datum muss im deutschen Format angegeben werden",
      "Die vollständige Flurstücksnummer finden Sie im Grundbuchauszug",
    ],
  }
}
