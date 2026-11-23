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

export interface ProspectRepository {
  ajouter(nouveau: NouveauProspect): Promise<Prospect>
  /** Le plus récent en premier. */
  lister(): Promise<Prospect[]>
}
