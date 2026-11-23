export const ETAPES = [
  "Nouveau",
  "Contacté",
  "Réponse reçue",
  "RDV",
  "Gagné",
  "Perdu",
] as const

export type Etape = (typeof ETAPES)[number]

export type Prospect = {
  id: string
  nom: string
  societe: string | null
  email: string | null
  telephone: string | null
  etape: Etape
  /** Format YYYY-MM-DD, sans fuseau. */
  dateRelance: string | null
  notes: string | null
  /** ISO 8601 UTC. */
  creeLe: string
}

export type NouveauProspect = {
  nom: string
  societe: string | null
  email: string | null
  telephone: string | null
  etape: Etape
}

/** Informations modifiables d'un prospect (tout sauf l'id, l'étape et la création). */
export type DonneesProspect = {
  nom: string
  societe: string | null
  email: string | null
  telephone: string | null
  /** Format YYYY-MM-DD. */
  dateRelance: string | null
  notes: string | null
}

export interface ProspectRepository {
  ajouter(nouveau: NouveauProspect): Promise<Prospect>
  /** Le plus récent en premier. */
  lister(): Promise<Prospect[]>
  /** Renvoie le prospect mis à jour, ou null si l'id est inconnu. */
  changerEtape(id: string, etape: Etape): Promise<Prospect | null>
  /** Date YYYY-MM-DD ou null pour l'effacer. Null si l'id est inconnu. */
  definirDateRelance(id: string, date: string | null): Promise<Prospect | null>
  /** Remplace les informations du prospect. Null si l'id est inconnu. */
  modifier(id: string, donnees: DonneesProspect): Promise<Prospect | null>
  /** True si le prospect existait et a été supprimé. */
  supprimer(id: string): Promise<boolean>
}
