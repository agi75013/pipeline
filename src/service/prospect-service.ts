import { ETAPES } from "@/data/prospect"
import type { Etape, Prospect, ProspectRepository } from "@/data/prospect"

export type { Prospect, Etape } from "@/data/prospect"
export { ETAPES }

export type SaisieProspect = {
  nom?: string
  societe?: string
  email?: string
  telephone?: string
}

export type ErreursSaisie = { nom?: string; contact?: string }

export type ResultatCreation =
  | { ok: true; prospect: Prospect }
  | { ok: false; erreurs: ErreursSaisie }

export type ResultatChangementEtape =
  | { ok: true; prospect: Prospect }
  | { ok: false; erreur: string }

const etapeValide = (valeur: string): valeur is Etape =>
  (ETAPES as readonly string[]).includes(valeur)

const nettoyer = (valeur?: string) => {
  const texte = valeur?.trim()
  return texte ? texte : null
}

export function createProspectService(depot: ProspectRepository) {
  return {
    async creerProspect(saisie: SaisieProspect): Promise<ResultatCreation> {
      const nom = nettoyer(saisie.nom)
      const email = nettoyer(saisie.email)
      const telephone = nettoyer(saisie.telephone)

      const erreurs: ErreursSaisie = {}
      if (!nom) erreurs.nom = "Le nom est obligatoire"
      if (!email && !telephone) {
        erreurs.contact = "Renseignez un email ou un téléphone"
      }
      if (!nom || Object.keys(erreurs).length > 0) {
        return { ok: false, erreurs }
      }

      const prospect = await depot.ajouter({
        nom,
        societe: nettoyer(saisie.societe),
        email,
        telephone,
        etape: "Nouveau",
      })
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
      if (typeof id !== "string" || !id.trim()) {
        return { ok: false, erreur: "Prospect introuvable" }
      }
      const prospect = await depot.changerEtape(id, etape)
      if (!prospect) return { ok: false, erreur: "Prospect introuvable" }
      return { ok: true, prospect }
    },
  }
}

export type ProspectService = ReturnType<typeof createProspectService>
