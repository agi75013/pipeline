import { ETAPES } from "@/data/prospect"
import type { Etape, Prospect, ProspectRepository } from "@/data/prospect"
import { horlogeSysteme, type Horloge } from "@/service/horloge"

export type { Prospect, Etape } from "@/data/prospect"
export { ETAPES }

export type SaisieProspect = {
  nom?: string
  societe?: string
  email?: string
  telephone?: string
}

export type ErreursSaisie = { nom?: string; contact?: string }

export type SaisieModification = SaisieProspect & {
  dateRelance?: string
  notes?: string
}

export type ErreursModification = ErreursSaisie & {
  dateRelance?: string
  prospect?: string
}

export type ResultatEdition =
  | { ok: true; prospect: Prospect }
  | { ok: false; erreurs: ErreursModification }

export type ResultatCreation =
  | { ok: true; prospect: Prospect }
  | { ok: false; erreurs: ErreursSaisie }

export type ResultatModification =
  | { ok: true; prospect: Prospect }
  | { ok: false; erreur: string }

export type ResultatChangementEtape =
  | { ok: true; prospect: Prospect }
  | { ok: false; erreur: string }

const etapeValide = (valeur: string): valeur is Etape =>
  (ETAPES as readonly string[]).includes(valeur)

const nettoyer = (valeur?: string) => {
  const texte = valeur?.trim()
  return texte ? texte : null
}

const idValide = (id: unknown): id is string =>
  typeof id === "string" && id.trim() !== ""

/** Date réelle au format YYYY-MM-DD (refuse 2026-02-30). */
const dateValide = (valeur: unknown): valeur is string => {
  if (typeof valeur !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valeur)) {
    return false
  }
  const date = new Date(`${valeur}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(valeur)
}

const INTROUVABLE = "Prospect introuvable"

/** Règles communes à l'ajout et à la modification : nom et contact obligatoires. */
function validerIdentite(saisie: SaisieProspect) {
  const nom = nettoyer(saisie.nom)
  const email = nettoyer(saisie.email)
  const telephone = nettoyer(saisie.telephone)
  const erreurs: ErreursSaisie = {}
  if (!nom) erreurs.nom = "Le nom est obligatoire"
  if (!email && !telephone) {
    erreurs.contact = "Renseignez un email ou un téléphone"
  }
  const identite = { nom: nom ?? "", societe: nettoyer(saisie.societe), email, telephone }
  return { identite, erreurs }
}

export function createProspectService(
  depot: ProspectRepository,
  horloge: Horloge = horlogeSysteme,
) {
  return {
    async creerProspect(saisie: SaisieProspect): Promise<ResultatCreation> {
      const { identite, erreurs } = validerIdentite(saisie)
      if (Object.keys(erreurs).length > 0) return { ok: false, erreurs }
      const prospect = await depot.ajouter({ ...identite, etape: "Nouveau" })
      return { ok: true, prospect }
    },

    async modifierProspect(
      id: string,
      saisie: SaisieModification,
    ): Promise<ResultatEdition> {
      const { identite, erreurs } = validerIdentite(saisie)
      const dateRelance = nettoyer(saisie.dateRelance)
      const erreursModification: ErreursModification = { ...erreurs }
      if (dateRelance !== null && !dateValide(dateRelance)) {
        erreursModification.dateRelance = "Date de relance invalide"
      }
      if (Object.keys(erreursModification).length > 0) {
        return { ok: false, erreurs: erreursModification }
      }
      if (!idValide(id)) return { ok: false, erreurs: { prospect: INTROUVABLE } }
      const prospect = await depot.modifier(id, {
        ...identite,
        dateRelance,
        notes: nettoyer(saisie.notes),
      })
      if (!prospect) return { ok: false, erreurs: { prospect: INTROUVABLE } }
      return { ok: true, prospect }
    },

    listerProspects(): Promise<Prospect[]> {
      return depot.lister()
    },

    async changerEtape(
      id: string,
      etape: string,
    ): Promise<ResultatChangementEtape> {
      if (!etapeValide(etape)) {
        return { ok: false, erreur: `Étape inconnue : ${etape}` }
      }
      if (!idValide(id)) return { ok: false, erreur: INTROUVABLE }
      const prospect = await depot.changerEtape(id, etape)
      if (!prospect) return { ok: false, erreur: INTROUVABLE }
      return { ok: true, prospect }
    },

    async definirDateRelance(
      id: string,
      date: string | null,
    ): Promise<ResultatModification> {
      if (date !== null && !dateValide(date)) {
        return { ok: false, erreur: "Date de relance invalide" }
      }
      if (!idValide(id)) return { ok: false, erreur: INTROUVABLE }
      const prospect = await depot.definirDateRelance(id, date)
      if (!prospect) return { ok: false, erreur: INTROUVABLE }
      return { ok: true, prospect }
    },

    /** Relance due : date de relance aujourd'hui ou antérieure. Plus ancienne d'abord. */
    async listerARelancer(): Promise<Prospect[]> {
      const aujourdhui = horloge.aujourdhui()
      const prospects = await depot.lister()
      return prospects
        .filter((p) => p.dateRelance !== null && p.dateRelance <= aujourdhui)
        .sort((a, b) => a.dateRelance!.localeCompare(b.dateRelance!))
    },
  }
}

export type ProspectService = ReturnType<typeof createProspectService>
