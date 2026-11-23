"use server"

import { revalidatePath } from "next/cache"
import type { EtatFormulaire } from "@/presentation/prospect-form"
import { obtenirServiceProspects } from "@/service/default-prospect-service"

const texte = (formData: FormData, cle: string) => {
  const valeur = formData.get(cle)
  return typeof valeur === "string" ? valeur : ""
}

export type EtatChangementEtape = { erreur?: string }

export async function changerEtapeProspect(
  id: string,
  etape: string,
): Promise<EtatChangementEtape> {
  try {
    const resultat = await obtenirServiceProspects().changerEtape(id, etape)
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
  const saisie = {
    nom: texte(formData, "nom"),
    societe: texte(formData, "societe"),
    email: texte(formData, "email"),
    telephone: texte(formData, "telephone"),
  }
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
