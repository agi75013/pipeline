"use client"

import { useState, useTransition } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ETAPES, type Etape } from "@/service/prospect-service"

export type ActionEtape = (
  id: string,
  etape: string,
) => Promise<{ erreur?: string }>

export function EtapeSelect({
  id,
  etape,
  action,
}: {
  id: string
  etape: Etape
  action: ActionEtape
}) {
  const [enCours, demarrer] = useTransition()
  const [erreur, setErreur] = useState<string>()

  const changer = (valeur: string | null) => {
    if (!valeur || valeur === etape) return
    demarrer(async () => {
      const resultat = await action(id, valeur)
      setErreur(resultat.erreur)
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <Select value={etape} onValueChange={changer} disabled={enCours}>
        <SelectTrigger size="sm" aria-label="Étape">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ETAPES.map((e) => (
            <SelectItem key={e} value={e}>
              {e}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {erreur && (
        <p role="alert" className="text-sm text-destructive">
          {erreur}
        </p>
      )}
    </div>
  )
}
