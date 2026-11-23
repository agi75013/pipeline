/** État renvoyé par les actions de formulaire (création, modification). */
export type EtatFormulaire = {
  erreurs?: { nom?: string; contact?: string; dateRelance?: string }
  /** Échec technique ou prospect introuvable, pas une erreur de champ. */
  erreurGenerale?: string
  /** Enregistrement réussi : la fiche peut se fermer. */
  succes?: boolean
  valeurs?: Record<string, string>
}

export type ActionFormulaire = (
  etat: EtatFormulaire,
  formData: FormData,
) => Promise<EtatFormulaire>

export type ActionSimple = (id: string, valeur: string) => Promise<{ erreur?: string }>
export type ActionSuppression = (id: string) => Promise<{ erreur?: string }>
export type ActionModification = (
  id: string,
  etat: EtatFormulaire,
  formData: FormData,
) => Promise<EtatFormulaire>
export type ActionAjoutRapide = (
  etape: string,
  nom: string,
  contact: string,
) => Promise<{
  id?: string
  erreurs?: { nom?: string; contact?: string }
  erreurGenerale?: string
}>
