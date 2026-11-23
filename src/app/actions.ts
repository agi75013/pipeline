"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { EtatFormulaire } from "@/presentation/prospect-form"
import { obtenirServiceProspects } from "@/service/default-prospect-service"
import { ETAPES } from "@/service/prospect-service"

// Les entrées d'une server action viennent du navigateur : on ne s'y fie pas.
// Ces schémas contrôlent la forme (texte, étape connue). Les règles métier
// (nom et contact obligatoires) restent dans le service.
const champTexte = z
  .string()
  .trim()
  .nullish()
  .transform((valeur) => valeur ?? "")

const saisieProspectSchema = z.object({
  nom: champTexte,
  societe: champTexte,
  email: champTexte,
  telephone: champTexte,
})

const changementEtapeSchema = z.object({
  id: z.string().trim().min(1),
  etape: z.enum(ETAPES),
})

export type EtatChangementEtape = { erreur?: string }

// Date vide = effacement (null). Sinon le format YYYY-MM-DD est exigé ;
// la validité réelle de la date (pas de 30 février) reste au service.
const dateRelanceSchema = z.object({
  id: z.string().trim().min(1),
  date: z
    .string()
    .trim()
    .transform((valeur) => valeur || null)
    .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()),
})

export async function definirDateRelanceProspect(
  id: string,
  date: string,
): Promise<EtatChangementEtape> {
  const entree = dateRelanceSchema.safeParse({ id, date })
  if (!entree.success) return { erreur: "Date de relance invalide." }
  try {
    const resultat = await obtenirServiceProspects().definirDateRelance(
      entree.data.id,
      entree.data.date,
    )
    if (!resultat.ok) return { erreur: resultat.erreur }
  } catch (erreur) {
    console.error("Échec de l'enregistrement de la date de relance", erreur)
    return { erreur: "Impossible d'enregistrer la date, réessayez." }
  }
  revalidatePath("/")
  return {}
}

export async function changerEtapeProspect(
  id: string,
  etape: string,
): Promise<EtatChangementEtape> {
  const entree = changementEtapeSchema.safeParse({ id, etape })
  if (!entree.success) return { erreur: "Étape ou prospect invalide." }
  try {
    const resultat = await obtenirServiceProspects().changerEtape(
      entree.data.id,
      entree.data.etape,
    )
    if (!resultat.ok) return { erreur: resultat.erreur }
  } catch (erreur) {
    console.error("Échec du changement d'étape", erreur)
    return { erreur: "Impossible de changer l'étape, réessayez." }
  }
  revalidatePath("/")
  return {}
}

export async function ajouterProspect(
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const lue = saisieProspectSchema.safeParse({
    nom: formData.get("nom"),
    societe: formData.get("societe"),
    email: formData.get("email"),
    telephone: formData.get("telephone"),
  })
  if (!lue.success) {
    return { erreurGenerale: "Saisie invalide, réessayez." }
  }
  const saisie = lue.data
  try {
    const resultat = await obtenirServiceProspects().creerProspect(saisie)
    if (!resultat.ok) return { erreurs: resultat.erreurs, valeurs: saisie }
  } catch (erreur) {
    console.error("Échec de l'ajout d'un prospect", erreur)
    return {
      erreurGenerale: "Impossible d'enregistrer, réessayez.",
      valeurs: saisie,
    }
  }
  revalidatePath("/")
  return {}
}
