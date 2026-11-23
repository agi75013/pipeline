"use client"

import { useState, useTransition } from "react"
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

export type ActionSuppression = (id: string) => Promise<{ erreur?: string }>

export function ProspectDeleteDialog({
  id,
  nom,
  action,
}: {
  id: string
  nom: string
  action: ActionSuppression
}) {
  const [ouvert, setOuvert] = useState(false)
  const [erreur, setErreur] = useState<string>()
  const [enCours, demarrer] = useTransition()

  const changerOuverture = (suivant: boolean) => {
    setOuvert(suivant)
    if (!suivant) setErreur(undefined)
  }

  const confirmer = () => {
    demarrer(async () => {
      const resultat = await action(id)
      if (resultat.erreur) {
        setErreur(resultat.erreur)
        return
      }
      changerOuverture(false)
    })
  }

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm" aria-label={`Supprimer ${nom}`} />
        }
      >
        Supprimer
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Supprimer {nom} ?</DialogTitle>
          <DialogDescription>
            Le prospect disparaîtra de la liste et des relances. Cette action est
            définitive.
          </DialogDescription>
        </DialogHeader>
        {erreur && (
          <p role="alert" className="text-sm text-destructive">
            {erreur}
          </p>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          <Button variant="destructive" onClick={confirmer} disabled={enCours}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
