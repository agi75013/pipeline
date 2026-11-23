"use client"

import { useActionState, useId, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { EtatFormulaire } from "@/presentation/prospect-form"
import type { Prospect } from "@/service/prospect-service"

export type ActionModification = (
  id: string,
  etat: EtatFormulaire,
  formData: FormData,
) => Promise<EtatFormulaire>

const valeursDuProspect = (p: Prospect): Record<string, string> => ({
  nom: p.nom,
  societe: p.societe ?? "",
  email: p.email ?? "",
  telephone: p.telephone ?? "",
  dateRelance: p.dateRelance ?? "",
  notes: p.notes ?? "",
})

export function ProspectEditDialog({
  prospect,
  action,
}: {
  prospect: Prospect
  action: ActionModification
}) {
  const [ouvert, setOuvert] = useState(false)
  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={`Modifier ${prospect.nom}`}
          />
        }
      >
        Modifier
      </DialogTrigger>
      <DialogContent>
        {/* Monté à chaque ouverture : le formulaire repart des valeurs du prospect. */}
        <FormulaireModification
          prospect={prospect}
          action={action}
          fermer={() => setOuvert(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function FormulaireModification({
  prospect,
  action,
  fermer,
}: {
  prospect: Prospect
  action: ActionModification
  fermer: () => void
}) {
  const [etat, formAction, enCours] = useActionState(
    async (precedent: EtatFormulaire, formData: FormData) => {
      const suivant = await action(prospect.id, precedent, formData)
      if (suivant.succes) fermer()
      return suivant
    },
    {},
  )
  const erreurs = etat.erreurs ?? {}
  const valeurs = etat.valeurs ?? valeursDuProspect(prospect)
  const prefixe = useId()
  const champ = (nom: string) => `${prefixe}-${nom}`

  return (
    <form action={formAction} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Modifier le prospect</DialogTitle>
        <DialogDescription>
          Un nom, et au moins un email ou un téléphone.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-1.5">
        <Label htmlFor={champ("nom")}>Nom</Label>
        <Input
          id={champ("nom")}
          name="nom"
          defaultValue={valeurs.nom}
          aria-invalid={erreurs.nom ? true : undefined}
          aria-describedby={erreurs.nom ? champ("nom-erreur") : undefined}
        />
        {erreurs.nom && (
          <p id={champ("nom-erreur")} role="alert" className="text-sm text-destructive">
            {erreurs.nom}
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={champ("societe")}>Société</Label>
        <Input id={champ("societe")} name="societe" defaultValue={valeurs.societe} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={champ("email")}>Email</Label>
        <Input
          id={champ("email")}
          name="email"
          type="email"
          defaultValue={valeurs.email}
          aria-invalid={erreurs.contact ? true : undefined}
          aria-describedby={erreurs.contact ? champ("contact-erreur") : undefined}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={champ("telephone")}>Téléphone</Label>
        <Input
          id={champ("telephone")}
          name="telephone"
          type="tel"
          defaultValue={valeurs.telephone}
          aria-invalid={erreurs.contact ? true : undefined}
          aria-describedby={erreurs.contact ? champ("contact-erreur") : undefined}
        />
        {erreurs.contact && (
          <p
            id={champ("contact-erreur")}
            role="alert"
            className="text-sm text-destructive"
          >
            {erreurs.contact}
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={champ("dateRelance")}>Date de relance</Label>
        <Input
          id={champ("dateRelance")}
          name="dateRelance"
          type="date"
          defaultValue={valeurs.dateRelance}
          aria-invalid={erreurs.dateRelance ? true : undefined}
        />
        {erreurs.dateRelance && (
          <p role="alert" className="text-sm text-destructive">
            {erreurs.dateRelance}
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={champ("notes")}>Notes</Label>
        <Textarea id={champ("notes")} name="notes" defaultValue={valeurs.notes} />
      </div>
      {etat.erreurGenerale && (
        <p role="alert" className="text-sm text-destructive">
          {etat.erreurGenerale}
        </p>
      )}
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Annuler
        </DialogClose>
        <Button type="submit" disabled={enCours}>
          Enregistrer
        </Button>
      </DialogFooter>
    </form>
  )
}
