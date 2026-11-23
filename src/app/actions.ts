"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { EtatFormulaire } from "@/presentation/etats"
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

// Création depuis la fiche : identité, étape de départ, relance et notes.
const creationProspectSchema = z.object({
  saisie: saisieProspectSchema.extend({
    dateRelance: champTexte.refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v)),
    notes: champTexte,
  }),
  etape: z.enum(ETAPES),
})

export async function ajouterProspect(
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const lue = creationProspectSchema.safeParse({
    saisie: {
      nom: formData.get("nom"),
      societe: formData.get("societe"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      dateRelance: formData.get("dateRelance"),
      notes: formData.get("notes"),
    },
    etape: formData.get("etape") ?? "Nouveau",
  })
  if (!lue.success) {
    return { erreurGenerale: "Saisie invalide, réessayez." }
  }
  const { saisie, etape } = lue.data
  try {
    const resultat = await obtenirServiceProspects().creerProspect(saisie, { etape })
    if (!resultat.ok) {
      const { prospect, etape: erreurEtape, ...erreurs } = resultat.erreurs
      return { erreurs, erreurGenerale: prospect ?? erreurEtape, valeurs: saisie }
    }
  } catch (erreur) {
    console.error("Échec de l'ajout d'un prospect", erreur)
    return {
      erreurGenerale: "Impossible d'enregistrer, réessayez.",
      valeurs: saisie,
    }
  }
  revalidatePath("/")
  return { succes: true }
}

const ajoutRapideSchema = z.object({
  etape: z.enum(ETAPES),
  nom: z.string().trim(),
  contact: z.string().trim(),
})

export type EtatAjoutRapide = {
  id?: string
  erreurs?: { nom?: string; contact?: string }
  erreurGenerale?: string
}

export async function ajoutRapideProspect(
  etape: string,
  nom: string,
  contact: string,
): Promise<EtatAjoutRapide> {
  const entree = ajoutRapideSchema.safeParse({ etape, nom, contact })
  if (!entree.success) return { erreurGenerale: "Saisie invalide, réessayez." }
  try {
    const resultat = await obtenirServiceProspects().creerProspectRapide(
      entree.data.etape,
      entree.data.nom,
      entree.data.contact,
    )
    if (!resultat.ok) {
      const { nom: n, contact: c } = resultat.erreurs
      return { erreurs: { ...(n && { nom: n }), ...(c && { contact: c }) } }
    }
    revalidatePath("/")
    return { id: resultat.prospect.id }
  } catch (erreur) {
    console.error("Échec de l'ajout rapide", erreur)
    return { erreurGenerale: "Impossible d'enregistrer, réessayez." }
  }
}

const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/

const modificationProspectSchema = z.object({
  id: z.string().trim().min(1),
  saisie: saisieProspectSchema.extend({
    dateRelance: champTexte.refine(
      (valeur) => valeur === "" || FORMAT_DATE.test(valeur),
    ),
    notes: champTexte,
  }),
})

export async function modifierProspect(
  id: string,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const lue = modificationProspectSchema.safeParse({
    id,
    saisie: {
      nom: formData.get("nom"),
      societe: formData.get("societe"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      dateRelance: formData.get("dateRelance"),
      notes: formData.get("notes"),
    },
  })
  if (!lue.success) {
    return { erreurGenerale: "Saisie invalide, réessayez." }
  }
  const { saisie } = lue.data
  try {
    const resultat = await obtenirServiceProspects().modifierProspect(
      lue.data.id,
      saisie,
    )
    if (!resultat.ok) {
      const { prospect, ...erreurs } = resultat.erreurs
      return { erreurs, erreurGenerale: prospect, valeurs: saisie }
    }
  } catch (erreur) {
    console.error("Échec de la modification d'un prospect", erreur)
    return {
      erreurGenerale: "Impossible d'enregistrer, réessayez.",
      valeurs: saisie,
    }
  }
  revalidatePath("/")
  return { succes: true }
}

const suppressionSchema = z.object({ id: z.string().trim().min(1) })

export async function supprimerProspect(
  id: string,
): Promise<EtatChangementEtape> {
  const entree = suppressionSchema.safeParse({ id })
  if (!entree.success) return { erreur: "Prospect invalide." }
  try {
    const resultat = await obtenirServiceProspects().supprimerProspect(
      entree.data.id,
    )
    if (!resultat.ok) return { erreur: resultat.erreur }
  } catch (erreur) {
    console.error("Échec de la suppression d'un prospect", erreur)
    return { erreur: "Impossible de supprimer, réessayez." }
  }
  revalidatePath("/")
  return {}
}
