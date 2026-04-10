import type { Station, Project, ProjectType } from "./types"

export const projectTypeLabels: Record<ProjectType, string> = {
  baugenehmigung: "Baugenehmigung",
  nutzungsaenderung: "Nutzungsänderung",
  abgeschlossenheit: "Abgeschlossenheitsbescheinigung",
  bauvoranfrage: "Bauvoranfrage",
  abbruch: "Abbruchverfahren",
  werbeanlage: "Werbeanlage",
}

export function generateRoadmap(projectType: ProjectType, description: string): Station[] {
  const baseStations: Record<ProjectType, Station[]> = {
    baugenehmigung: [
      {
        id: "1",
        title: "Bauvoranfrage (optional)",
        description: "Klärung der grundsätzlichen Zulässigkeit vor dem eigentlichen Bauantrag",
        status: "pending",
        documents: [
          {
            id: "d1",
            name: "Antrag auf Bauvoranfrage",
            description: "Formular zur Prüfung der grundsätzlichen Bebaubarkeit",
            link: "https://bauportal.nrw/antraege",
            required: false,
          },
        ],
      },
      {
        id: "2",
        title: "Bauunterlagen vorbereiten",
        description: "Zusammenstellung aller erforderlichen Dokumente für den Bauantrag",
        status: "pending",
        documents: [
          {
            id: "d2",
            name: "Antrag auf Baugenehmigung",
            description: "Hauptformular für das Baugenehmigungsverfahren",
            link: "https://www.mhkbd.nrw/themenportal/bauordnung/anlagen-zur-vv-baupruefvo-vordrucke-fuer-bauantraege",
            required: true,
          },
          {
            id: "d3",
            name: "Baubeschreibung",
            description: "Detaillierte Beschreibung des geplanten Vorhabens",
            link: "https://www.mhkbd.nrw/themenportal/bauordnung/anlagen-zur-vv-baupruefvo-vordrucke-fuer-bauantraege",
            required: true,
          },
          {
            id: "d4",
            name: "Lageplan",
            description: "Amtlicher Lageplan im Maßstab 1:500",
            required: true,
          },
          {
            id: "d5",
            name: "Bauzeichnungen",
            description: "Grundrisse, Schnitte, Ansichten",
            required: true,
          },
        ],
      },
      {
        id: "3",
        title: "Kampfmittelbeseitigung",
        description: "Prüfung auf Kampfmittelbelastung vor Erdarbeiten",
        status: "pending",
        documents: [
          {
            id: "d6",
            name: "Anfrage Kampfmittelbeseitigung",
            description: "Pflichtanfrage vor Erdarbeiten",
            required: true,
          },
        ],
      },
      {
        id: "4",
        title: "Digitale Einreichung",
        description: "Einreichung über Bauportal.NRW (Pflicht seit 01.01.2024)",
        status: "pending",
        documents: [
          {
            id: "d7",
            name: "BundID oder ELSTER",
            description: "Authentifizierung für das Bauportal",
            link: "https://id.bund.de",
            required: true,
          },
        ],
      },
      {
        id: "5",
        title: "Prüfung durch Bauordnungsamt",
        description: "Vollständigkeitsprüfung und bauordnungsrechtliche Prüfung",
        status: "pending",
        documents: [],
      },
      {
        id: "6",
        title: "Baugenehmigung erhalten",
        description: "Genehmigungsbescheid vom Bauordnungsamt",
        status: "pending",
        documents: [],
      },
      {
        id: "7",
        title: "Baubeginnmitteilung",
        description: "Anzeige des Baubeginns vor Baubeginn",
        status: "pending",
        documents: [
          {
            id: "d8",
            name: "Baubeginnmitteilung",
            description: "Pflichtmeldung vor Beginn der Bauarbeiten",
            link: "https://bauportal.nrw/antraege",
            required: true,
          },
        ],
      },
      {
        id: "8",
        title: "Rohbaufertigstellung",
        description: "Meldung der Rohbaufertigstellung",
        status: "pending",
        documents: [
          {
            id: "d9",
            name: "Rohbaufertigstellung",
            description: "Meldung nach Fertigstellung des Rohbaus",
            link: "https://bauportal.nrw/antraege",
            required: true,
          },
        ],
      },
      {
        id: "9",
        title: "Fertigstellungsmitteilung",
        description: "Abschlussmeldung nach Fertigstellung der Bauarbeiten",
        status: "pending",
        documents: [
          {
            id: "d10",
            name: "Fertigstellungsmitteilung",
            description: "Meldung nach Abschluss aller Bauarbeiten",
            link: "https://bauportal.nrw/antraege",
            required: true,
          },
        ],
      },
    ],
    nutzungsaenderung: [
      {
        id: "1",
        title: "Nutzungsänderung prüfen",
        description: "Klärung ob eine Genehmigung erforderlich ist",
        status: "pending",
        documents: [],
      },
      {
        id: "2",
        title: "Anzeige Nutzungsänderung",
        description: "Einreichung der Nutzungsänderungsanzeige",
        status: "pending",
        documents: [
          {
            id: "d1",
            name: "Anzeige Nutzungsänderung",
            description: "Formular zur Anzeige einer Nutzungsänderung",
            link: "https://www.mhkbd.nrw/themenportal/bauordnung/anlagen-zur-vv-baupruefvo-vordrucke-fuer-bauantraege",
            required: true,
          },
          {
            id: "d2",
            name: "Betriebsbeschreibung",
            description: "Bei gewerblicher Nutzung erforderlich",
            required: false,
          },
        ],
      },
      {
        id: "3",
        title: "Genehmigung",
        description: "Erhalt der Genehmigung für die Nutzungsänderung",
        status: "pending",
        documents: [],
      },
    ],
    abgeschlossenheit: [
      {
        id: "1",
        title: "Unterlagen vorbereiten",
        description: "Zusammenstellung der erforderlichen Dokumente",
        status: "pending",
        documents: [
          {
            id: "d1",
            name: "Antrag Abgeschlossenheitsbescheinigung",
            description: "Antragsformular für die Aufteilung in Eigentumswohnungen",
            link: "https://formulare.stadt-muenster.de/administrationCenter/Form-Solutions/05512000-0002/consent",
            required: true,
          },
          {
            id: "d2",
            name: "Aufteilungsplan",
            description: "Grundrisse, Schnitte, Ansichten mit Nummerierung der Einheiten",
            required: true,
          },
          {
            id: "d3",
            name: "Nachweis Eigentümerschaft",
            description: "Aktueller Grundbuchauszug",
            required: true,
          },
        ],
      },
      {
        id: "2",
        title: "Einreichung",
        description: "Einreichung über Bauportal.NRW oder städtisches Formular",
        status: "pending",
        documents: [],
      },
      {
        id: "3",
        title: "Abgeschlossenheitsbescheinigung erhalten",
        description: "Bestätigung der baulichen Abgeschlossenheit der Einheiten",
        status: "pending",
        documents: [],
      },
    ],
    bauvoranfrage: [
      {
        id: "1",
        title: "Bauvoranfrage vorbereiten",
        description: "Formulierung der konkreten Fragestellung",
        status: "pending",
        documents: [
          {
            id: "d1",
            name: "Antrag auf Bauvoranfrage",
            description: "Formular für die Bauvoranfrage",
            link: "https://bauportal.nrw/antraege",
            required: true,
          },
          {
            id: "d2",
            name: "Lageplan",
            description: "Übersichtsplan des Grundstücks",
            required: true,
          },
        ],
      },
      {
        id: "2",
        title: "Einreichung",
        description: "Digitale Einreichung über Bauportal.NRW",
        status: "pending",
        documents: [],
      },
      {
        id: "3",
        title: "Bauvorbescheid erhalten",
        description: "Schriftliche, rechtsverbindliche Auskunft zur Zulässigkeit",
        status: "pending",
        documents: [],
      },
    ],
    abbruch: [
      {
        id: "1",
        title: "Abbruchverfahren wählen",
        description: "Prüfung ob Anzeige oder Genehmigung erforderlich",
        status: "pending",
        documents: [
          {
            id: "d1",
            name: "Abbruchverfahren Formular",
            description: "Antrag für das Abbruchverfahren",
            link: "https://www.mhkbd.nrw/themenportal/bauordnung/anlagen-zur-vv-baupruefvo-vordrucke-fuer-bauantraege",
            required: true,
          },
        ],
      },
      {
        id: "2",
        title: "Kampfmittelprüfung",
        description: "Anfrage zur Kampfmittelbeseitigung vor Erdarbeiten",
        status: "pending",
        documents: [
          {
            id: "d2",
            name: "Anfrage Kampfmittelbeseitigung",
            description: "Pflichtanfrage vor Abbrucharbeiten",
            required: true,
          },
        ],
      },
      {
        id: "3",
        title: "Freigabe",
        description: "Erhalt der Freigabe für den Abbruch",
        status: "pending",
        documents: [],
      },
    ],
    werbeanlage: [
      {
        id: "1",
        title: "Anzeige vorbereiten",
        description: "Prüfung der Genehmigungspflicht und Unterlagenvorbereitung",
        status: "pending",
        documents: [
          {
            id: "d1",
            name: "Anzeige Werbeanlagenvorhaben",
            description: "Formular für Werbeanlagen",
            link: "https://www.mhkbd.nrw/themenportal/bauordnung/anlagen-zur-vv-baupruefvo-vordrucke-fuer-bauantraege",
            required: true,
          },
        ],
      },
      {
        id: "2",
        title: "Einreichung",
        description: "Digitale Einreichung über Bauportal.NRW",
        status: "pending",
        documents: [],
      },
      {
        id: "3",
        title: "Genehmigung",
        description: "Erhalt der Genehmigung für die Werbeanlage",
        status: "pending",
        documents: [],
      },
    ],
  }

  return baseStations[projectType] || []
}

export function createProject(
  name: string,
  description: string,
  type: ProjectType
): Project {
  return {
    id: Math.random().toString(36).substring(7),
    name,
    description,
    type,
    createdAt: new Date(),
    stations: generateRoadmap(type, description),
  }
}
