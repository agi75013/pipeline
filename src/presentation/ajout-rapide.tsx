"use client"

import { useRef, useState, useTransition } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Etape } from "@/service/prospect-service"

/** « Ajouter ici » en pied de colonne : un nom et un contact, sans quitter le tableau. */
export function AjoutRapide({
  etape,
  onAjouter,
}: {
  etape: Etape
  onAjouter: (nom: string, contact: string) => Promise<{ erreurs?: { nom?: string; contact?: string }; erreurGenerale?: string }>
}) {
  const [ouvert, setOuvert] = useState(false)
  const [erreur, setErreur] = useState<string>()
  const [enCours, demarrer] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  if (!ouvert) {
    return (
      <Button
        variant="outline"
        className="h-10 w-full justify-start border-dashed bg-transparent font-extrabold text-muted-foreground hover:bg-card hover:text-foreground"
        aria-label={`Ajouter dans ${etape}`}
        onClick={() => setOuvert(true)}
      >
        <PlusIcon aria-hidden />
        Ajouter ici
      </Button>
    )
  }

  const fermer = () => {
    setOuvert(false)
    setErreur(undefined)
  }

  return (
    <form
      ref={formRef}
      noValidate
      className="grid gap-2 rounded-[10px] bg-card p-2.5 shadow-fiche ring-1 ring-border"
      onKeyDown={(e) => e.key === "Escape" && fermer()}
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const nom = (form.elements.namedItem("nom") as HTMLInputElement).value
        const contact = (form.elements.namedItem("contact") as HTMLInputElement).value
        demarrer(async () => {
          const r = await onAjouter(nom, contact)
          if (r.erreurs || r.erreurGenerale) {
            setErreur(r.erreurGenerale ?? [r.erreurs?.nom, r.erreurs?.contact].filter(Boolean).join(". ") + ".")
            return
          }
          setErreur(undefined)
          form.reset()
          ;(form.elements.namedItem("nom") as HTMLInputElement).focus()
        })
      }}
    >
      <Input name="nom" aria-label="Nom du prospect" placeholder="Nom" autoComplete="off" autoFocus />
      <Input name="contact" aria-label="Email ou téléphone" placeholder="Email ou téléphone" autoComplete="off" />
      {erreur && (
        <p role="alert" className="text-[13px] font-bold text-destructive">
          {erreur}
        </p>
      )}
      <div className="flex gap-1.5">
        <Button type="submit" disabled={enCours}>
          Ajouter
        </Button>
        <Button type="button" variant="ghost" onClick={fermer}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
