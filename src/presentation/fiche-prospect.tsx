"use client"

import { useActionState, useId, useState, useTransition } from "react"
import { Trash2Icon, XIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ActionFormulaire, ActionModification, EtatFormulaire } from "@/presentation/etats"
import { decalerDate, libelleRelance } from "@/presentation/libelles"
import { ETAPES, type Etape, type Prospect } from "@/service/prospect-service"
import { ecartJours } from "@/service/vue-pipeline"

export type ModeFiche = { prospect: Prospect } | { creation: true; etape: Etape }

type Props = {
  mode: ModeFiche | null
  aujourdhui: string
  cote: "right" | "bottom"
  onFermer: () => void
  ajouter: ActionFormulaire
  modifier: ActionModification
  onChangerEtape: (id: string, etape: Etape) => void
  onSupprimer: (id: string) => Promise<{ erreur?: string }>
}

/** Fiche prospect : panneau latéral sur ordinateur, panneau du bas sur mobile. */
export function FicheProspect({ mode, cote, onFermer, ...reste }: Props) {
  const cle = mode ? ("prospect" in mode ? mode.prospect.id : `nouveau-${mode.etape}`) : "ferme"
  return (
    <Sheet open={mode !== null} onOpenChange={(ouvert) => !ouvert && onFermer()}>
      <SheetContent
        side={cote}
        showCloseButton={false}
        className={cn(
          "gap-0 bg-card p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[440px]",
          "data-[side=bottom]:h-[92dvh] data-[side=bottom]:rounded-t-[18px]",
        )}
      >
        {mode && <Contenu key={cle} mode={mode} onFermer={onFermer} {...reste} />}
      </SheetContent>
    </Sheet>
  )
}

function Contenu({
  mode,
  aujourdhui,
  onFermer,
  ajouter,
  modifier,
  onChangerEtape,
  onSupprimer,
}: Omit<Props, "mode" | "cote"> & { mode: ModeFiche }) {
  const prospect = "prospect" in mode ? mode.prospect : null
  const etape = prospect ? prospect.etape : (mode as { etape: Etape }).etape
  const [etat, formAction, enCours] = useActionState(async (precedent: EtatFormulaire, formData: FormData) => {
    const suivant = prospect ? await modifier(prospect.id, precedent, formData) : await ajouter(precedent, formData)
    if (suivant.succes) onFermer()
    return suivant
  }, {})
  const valeurs = etat.valeurs ?? {
    nom: prospect?.nom ?? "",
    societe: prospect?.societe ?? "",
    email: prospect?.email ?? "",
    telephone: prospect?.telephone ?? "",
    notes: prospect?.notes ?? "",
  }
  const [date, setDate] = useState(etat.valeurs?.dateRelance ?? prospect?.dateRelance ?? "")
  const [etapeCreation, setEtapeCreation] = useState<Etape>(etape)
  const erreurs = etat.erreurs ?? {}
  const id = useId()
  const champ = (nom: string) => `${id}-${nom}`
  const etapeAffichee = prospect ? etape : etapeCreation

  const etatDate = date
    ? date <= aujourdhui
      ? `À relancer : ${libelleRelance(date, ecartJours(date, aujourdhui)).long.toLowerCase()}.`
      : `Relance prévue ${libelleRelance(date, ecartJours(date, aujourdhui)).long.toLowerCase()}.`
    : "Pas de relance prévue."

  return (
    <form action={formAction} noValidate className="flex min-h-0 flex-1 flex-col">
      <SheetHeader data-etape={etapeAffichee} className="flex-row items-center gap-2 bg-(--c) py-4 pr-3 pl-5 text-encre-fiche transition-colors max-sm:rounded-t-[18px]">
        <div className="min-w-0 flex-1">
          <SheetTitle className="text-lg font-black text-encre-fiche [overflow-wrap:anywhere]">
            {prospect ? prospect.nom : "Nouveau prospect"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {prospect ? "Voir et modifier ce prospect." : "Un nom, et au moins un email ou un téléphone."}
          </SheetDescription>
        </div>
        <SheetClose render={<Button type="button" variant="ghost" size="icon" className="text-encre-fiche hover:bg-encre-fiche/10" aria-label="Fermer la fiche" />}>
          <XIcon />
        </SheetClose>
      </SheetHeader>

      <div className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-5 py-4">
        <Champ id={champ("nom")} libelle="Nom" erreur={erreurs.nom}>
          <Input id={champ("nom")} name="nom" defaultValue={valeurs.nom} autoComplete="off" aria-invalid={erreurs.nom ? true : undefined} />
        </Champ>
        <Champ id={champ("societe")} libelle="Société">
          <Input id={champ("societe")} name="societe" defaultValue={valeurs.societe} autoComplete="off" />
        </Champ>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ id={champ("email")} libelle="Email">
            <Input id={champ("email")} name="email" type="email" inputMode="email" defaultValue={valeurs.email} autoComplete="off" aria-invalid={erreurs.contact ? true : undefined} />
          </Champ>
          <Champ id={champ("tel")} libelle="Téléphone">
            <Input id={champ("tel")} name="telephone" type="tel" inputMode="tel" defaultValue={valeurs.telephone} autoComplete="off" aria-invalid={erreurs.contact ? true : undefined} />
          </Champ>
        </div>
        {erreurs.contact && <p role="alert" className="-mt-2 text-[13px] font-bold text-destructive">{erreurs.contact}</p>}

        <fieldset className="grid gap-1.5">
          <legend className="mb-1.5 text-[13px] font-extrabold">Étape</legend>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {ETAPES.map((e) => (
              <label key={e} data-etape={e} className="relative">
                <input
                  type="radio"
                  name="etape"
                  value={e}
                  className="peer sr-only"
                  checked={etapeAffichee === e}
                  onChange={() => (prospect ? onChangerEtape(prospect.id, e) : setEtapeCreation(e))}
                />
                <span className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 text-[13px] font-bold transition-colors peer-checked:border-(--trait) peer-checked:bg-(--c) peer-checked:font-black peer-checked:text-encre-fiche peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground">
                  <i className="pastille-etape" aria-hidden />
                  {e}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Champ id={champ("date")} libelle="Date de relance" erreur={erreurs.dateRelance}>
          <Input id={champ("date")} name="dateRelance" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="flex flex-wrap gap-1.5">
            {([["Aujourd'hui", 0], ["Demain", 1], ["Dans 1 semaine", 7], ["Dans 1 mois", 30]] as const).map(([libelle, jours]) => (
              <Button key={libelle} type="button" variant="outline" size="sm" className="rounded-full font-extrabold" onClick={() => setDate(decalerDate(aujourdhui, jours))}>
                {libelle}
              </Button>
            ))}
            <Button type="button" variant="outline" size="sm" className="rounded-full font-extrabold" onClick={() => setDate("")}>
              Aucune
            </Button>
          </div>
          <p className={cn("text-[13px] font-extrabold text-muted-foreground", date && date <= aujourdhui && "text-destructive")}>{etatDate}</p>
        </Champ>

        <Champ id={champ("notes")} libelle="Notes">
          <Textarea id={champ("notes")} name="notes" defaultValue={valeurs.notes} placeholder="Ce qui a été dit, la prochaine étape…" className="min-h-28" />
        </Champ>
      </div>

      <SheetFooter className="flex-row items-center gap-2 border-t border-border px-5 pt-3.5 pb-[calc(14px+env(safe-area-inset-bottom))]">
        {prospect ? <Suppression prospect={prospect} onSupprimer={onSupprimer} onFermer={onFermer} /> : <span className="mr-auto" />}
        {etat.erreurGenerale && <p role="alert" className="text-[13px] font-bold text-destructive">{etat.erreurGenerale}</p>}
        <SheetClose render={<Button type="button" variant="outline" />}>Annuler</SheetClose>
        <Button type="submit" disabled={enCours}>
          {prospect ? "Enregistrer" : "Ajouter"}
        </Button>
      </SheetFooter>
    </form>
  )
}

function Champ({ id, libelle, erreur, children }: { id: string; libelle: string; erreur?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[13px] font-extrabold">
        {libelle}
      </Label>
      {children}
      {erreur && (
        <p role="alert" className="text-[13px] font-bold text-destructive">
          {erreur}
        </p>
      )}
    </div>
  )
}

function Suppression({
  prospect,
  onSupprimer,
  onFermer,
}: {
  prospect: Prospect
  onSupprimer: (id: string) => Promise<{ erreur?: string }>
  onFermer: () => void
}) {
  const [ouvert, setOuvert] = useState(false)
  const [erreur, setErreur] = useState<string>()
  const [enCours, demarrer] = useTransition()
  return (
    <>
      <Button type="button" variant="ghost" className="mr-auto font-extrabold text-destructive hover:text-destructive" onClick={() => setOuvert(true)}>
        <Trash2Icon aria-hidden />
        Supprimer
      </Button>
      <AlertDialog open={ouvert} onOpenChange={setOuvert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {prospect.nom} ?</AlertDialogTitle>
            <AlertDialogDescription>Il disparaîtra du tableau et des relances. Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          {erreur && (
            <p role="alert" className="text-[13px] font-bold text-destructive">
              {erreur}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={enCours}
              onClick={() =>
                demarrer(async () => {
                  const r = await onSupprimer(prospect.id)
                  if (r.erreur) return setErreur(r.erreur)
                  setOuvert(false)
                  onFermer()
                })
              }
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
