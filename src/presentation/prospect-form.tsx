"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type EtatFormulaire = {
  erreurs?: { nom?: string; contact?: string }
  valeurs?: Record<string, string>
}

export type ActionFormulaire = (
  etat: EtatFormulaire,
  formData: FormData,
) => Promise<EtatFormulaire>

export function ProspectForm({ action }: { action: ActionFormulaire }) {
  const [etat, formAction, enCours] = useActionState(action, {})
  const erreurs = etat.erreurs ?? {}
  const valeurs = etat.valeurs ?? {}

  return (
    <Card>
      <form action={formAction} noValidate>
        <CardHeader>
          <CardTitle className="text-xl">Nouveau prospect</CardTitle>
          <CardDescription>
            Un nom, et au moins un email ou un téléphone.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              name="nom"
              defaultValue={valeurs.nom}
              aria-invalid={erreurs.nom ? true : undefined}
              aria-describedby={erreurs.nom ? "nom-erreur" : undefined}
            />
            {erreurs.nom && (
              <p id="nom-erreur" role="alert" className="text-sm text-destructive">
                {erreurs.nom}
              </p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="societe">Société</Label>
            <Input id="societe" name="societe" defaultValue={valeurs.societe} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={valeurs.email}
              aria-invalid={erreurs.contact ? true : undefined}
              aria-describedby={erreurs.contact ? "contact-erreur" : undefined}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              name="telephone"
              type="tel"
              defaultValue={valeurs.telephone}
              aria-invalid={erreurs.contact ? true : undefined}
              aria-describedby={erreurs.contact ? "contact-erreur" : undefined}
            />
            {erreurs.contact && (
              <p
                id="contact-erreur"
                role="alert"
                className="text-sm text-destructive"
              >
                {erreurs.contact}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={enCours}>
            Ajouter
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
