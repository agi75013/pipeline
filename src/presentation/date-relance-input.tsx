"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"

export type ActionDateRelance = (
  id: string,
  date: string,
) => Promise<{ erreur?: string }>

export function DateRelanceInput({
  id,
  dateRelance,
  action,
}: {
  id: string
  dateRelance: string | null
  action: ActionDateRelance
}) {
  const [enCours, demarrer] = useTransition()
  const [erreur, setErreur] = useState<string>()

  const changer = (valeur: string) => {
    demarrer(async () => {
      const resultat = await action(id, valeur)
      setErreur(resultat.erreur)
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <Input
        type="date"
        aria-label="Date de relance"
        defaultValue={dateRelance ?? ""}
        disabled={enCours}
        onChange={(e) => changer(e.target.value)}
        className="h-8 w-auto"
      />
      {erreur && (
        <p role="alert" className="text-sm text-destructive">
          {erreur}
        </p>
      )}
    </div>
  )
}
