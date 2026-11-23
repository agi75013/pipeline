// Règles de lecture du pipeline, sans accès aux données : utilisables côté
// serveur comme côté navigateur (recherche instantanée, mises à jour optimistes).
import type { Prospect } from "@/data/prospect"

const MS_JOUR = 86_400_000
const enJours = (date: string) => Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)) / MS_JOUR

/** Jours entre aujourd'hui et la date (négatif : dans le passé). Dates YYYY-MM-DD. */
export function ecartJours(date: string, aujourdhui: string): number {
  return Math.round(enJours(date) - enJours(aujourdhui))
}

/** À relancer : date de relance aujourd'hui ou antérieure. */
export function estDue(prospect: Prospect, aujourdhui: string): boolean {
  return prospect.dateRelance !== null && prospect.dateRelance <= aujourdhui
}

/** Les relances dues, la plus ancienne en premier. */
export function relancesDues(prospects: Prospect[], aujourdhui: string): Prospect[] {
  return prospects
    .filter((p) => estDue(p, aujourdhui))
    .sort((a, b) => a.dateRelance!.localeCompare(b.dateRelance!))
}

export type FiltreRelance = "" | "due" | "retard" | "prevue" | "aucune"
export type Filtres = { texte?: string; relance?: FiltreRelance }

const normaliser = (texte: string | null) =>
  (texte ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export function filtrerProspects(
  prospects: Prospect[],
  filtres: Filtres,
  aujourdhui: string,
): Prospect[] {
  const texte = normaliser(filtres.texte ?? "").trim()
  return prospects.filter((p) => {
    if (texte && ![p.nom, p.societe, p.email, p.telephone].some((v) => normaliser(v).includes(texte))) {
      return false
    }
    switch (filtres.relance) {
      case "due": return estDue(p, aujourdhui)
      case "retard": return p.dateRelance !== null && p.dateRelance < aujourdhui
      case "prevue": return p.dateRelance !== null && p.dateRelance > aujourdhui
      case "aucune": return p.dateRelance === null
      default: return true
    }
  })
}

/** Un contact saisi en un seul champ : email s'il contient « @ », sinon téléphone. */
export function analyserContact(contact: string): { email: string; telephone: string } {
  const valeur = contact.trim()
  return valeur.includes("@") ? { email: valeur, telephone: "" } : { email: "", telephone: valeur }
}
