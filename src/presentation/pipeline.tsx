"use client"

import { useRef, useState, useSyncExternalStore } from "react"
import { PlusIcon, SearchIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/sonner"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { AjoutRapide } from "@/presentation/ajout-rapide"
import { BandeauRelances } from "@/presentation/bandeau-relances"
import { CarteProspect } from "@/presentation/carte-prospect"
import type {
  ActionAjoutRapide,
  ActionFormulaire,
  ActionModification,
  ActionSimple,
  ActionSuppression,
} from "@/presentation/etats"
import { FicheProspect, type ModeFiche } from "@/presentation/fiche-prospect"
import { useGlisser } from "@/presentation/use-glisser"
import { ETAPES, type Etape, type Prospect } from "@/service/prospect-service"
import { analyserContact, filtrerProspects, relancesDues, type FiltreRelance } from "@/service/vue-pipeline"

export type ActionsPipeline = {
  changerEtape: ActionSimple
  definirDateRelance: ActionSimple
  ajouter: ActionFormulaire
  modifier: ActionModification
  supprimer: ActionSuppression
  ajoutRapide: ActionAjoutRapide
}

const FILTRES: { valeur: FiltreRelance; libelle: string }[] = [
  { valeur: "", libelle: "Toutes" },
  { valeur: "due", libelle: "À relancer" },
  { valeur: "retard", libelle: "En retard" },
  { valeur: "prevue", libelle: "Prévues" },
  { valeur: "aucune", libelle: "Sans relance" },
]

const COURT: Partial<Record<Etape, string>> = { "Réponse reçue": "Réponse" }

const requeteMobile = "(max-width: 767px)"
const ecouterMobile = (rappel: () => void) => {
  if (typeof window === "undefined" || !window.matchMedia) return () => {}
  const m = window.matchMedia(requeteMobile)
  m.addEventListener("change", rappel)
  return () => m.removeEventListener("change", rappel)
}
const estMobile = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(requeteMobile).matches : false)

/** Le mur de post-it : relances du jour, 6 colonnes d'étapes, fiche latérale. */
export function Pipeline({
  prospects: duServeur,
  aujourdhui,
  actions,
}: {
  prospects: Prospect[]
  aujourdhui: string
  actions: ActionsPipeline
}) {
  // Copie locale pour les mises à jour optimistes ; reprise dès que le serveur renvoie une liste.
  const [source, setSource] = useState(duServeur)
  const [prospects, setProspects] = useState(duServeur)
  if (source !== duServeur) {
    setSource(duServeur)
    setProspects(duServeur)
  }

  const [texte, setTexte] = useState("")
  const [relance, setRelance] = useState<FiltreRelance>("")
  const [fiche, setFiche] = useState<ModeFiche | null>(null)
  const [courante, setCourante] = useState<Etape>("Nouveau")
  const mobile = useSyncExternalStore(ecouterMobile, estMobile, () => false)
  const tableau = useRef<HTMLDivElement>(null)
  const recherche = useRef<HTMLInputElement>(null)

  const dues = relancesDues(prospects, aujourdhui)
  const visibles = filtrerProspects(prospects, { texte, relance }, aujourdhui)
  const filtrage = texte.trim() !== "" || relance !== ""

  const changerLocal = (id: string, champs: Partial<Prospect>) =>
    setProspects((liste) => liste.map((p) => (p.id === id ? { ...p, ...champs } : p)))

  // Annuler un déplacement : on repart de l'étape connue, sans relire une liste
  // figée au moment du déplacement (elle montrerait la fiche déjà à sa place).
  const annulerDeplacement = async (id: string, ancienne: Etape, nouvelle: Etape) => {
    changerLocal(id, { etape: ancienne })
    const r = await actions.changerEtape(id, ancienne)
    if (r.erreur) {
      changerLocal(id, { etape: nouvelle })
      toast.error(r.erreur)
    }
  }

  const deplacer = async (id: string, etape: Etape) => {
    const avant = prospects.find((p) => p.id === id)
    if (!avant || avant.etape === etape) return
    changerLocal(id, { etape })
    const r = await actions.changerEtape(id, etape)
    if (r.erreur) {
      changerLocal(id, { etape: avant.etape })
      toast.error(r.erreur)
      return
    }
    toast(`${avant.nom} passe à « ${etape} »`, {
      action: { label: "Annuler", onClick: () => annulerDeplacement(id, avant.etape, etape) },
    })
  }

  const { glisse, cible, saisir, refVolante, vientDeGlisser } = useGlisser({
    tableau,
    onDeposer: (id, etape) => {
      deplacer(id, etape)
      if (mobile) aller(etape)
    },
  })

  const relanceFaite = async (id: string) => {
    const avant = prospects.find((p) => p.id === id)
    if (!avant) return
    changerLocal(id, { dateRelance: null })
    const r = await actions.definirDateRelance(id, "")
    if (r.erreur) {
      changerLocal(id, { dateRelance: avant.dateRelance })
      toast.error(r.erreur)
      return
    }
    toast(`Relance de ${avant.nom} faite`, {
      action: {
        label: "Annuler",
        onClick: async () => {
          changerLocal(id, { dateRelance: avant.dateRelance })
          const retour = await actions.definirDateRelance(id, avant.dateRelance ?? "")
          if (retour.erreur) {
            changerLocal(id, { dateRelance: null })
            toast.error(retour.erreur)
          }
        },
      },
    })
  }

  const ajoutRapide = async (etape: Etape, nom: string, contact: string) => {
    const r = await actions.ajoutRapide(etape, nom, contact)
    if (!r.id) {
      if (r.erreurGenerale) toast.error(r.erreurGenerale)
      return r
    }
    const id = r.id
    const { email, telephone } = analyserContact(contact)
    const ajoute: Prospect = { id, nom: nom.trim(), societe: null, email: email || null, telephone: telephone || null, etape, dateRelance: null, notes: null, creeLe: new Date().toISOString() }
    setProspects((liste) => [ajoute, ...liste])
    toast(`${nom.trim()} ajouté à « ${etape} »`, {
      action: {
        label: "Annuler",
        onClick: async () => {
          setProspects((liste) => liste.filter((p) => p.id !== id))
          const retour = await actions.supprimer(id)
          if (retour.erreur) {
            setProspects((liste) => (liste.some((p) => p.id === id) ? liste : [ajoute, ...liste]))
            toast.error(retour.erreur)
          }
        },
      },
    })
    return r
  }

  const supprimer = async (id: string) => {
    const avant = prospects.find((p) => p.id === id)
    const r = await actions.supprimer(id)
    if (r.erreur) return r
    setProspects((liste) => liste.filter((p) => p.id !== id))
    if (avant) toast(`${avant.nom} supprimé`)
    return r
  }

  function aller(etape: Etape) {
    const colonne = tableau.current?.querySelector<HTMLElement>(`[data-colonne="${etape}"]`)
    if (colonne && tableau.current) {
      const doux = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      tableau.current.scrollTo({ left: colonne.offsetLeft - 16, behavior: doux ? "smooth" : "auto" })
    }
  }

  const ouvrir = (id: string) => {
    const p = prospects.find((x) => x.id === id)
    if (p) setFiche({ prospect: p })
  }
  // La fiche ouverte suit la copie locale (étape changée, relance faite…).
  const ficheCourante: ModeFiche | null =
    fiche && "prospect" in fiche
      ? (() => {
          const p = prospects.find((x) => x.id === fiche.prospect.id)
          return p ? { prospect: p } : null
        })()
      : fiche

  const prospectGlisse = glisse ? prospects.find((p) => p.id === glisse.id) : undefined

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2.5 md:gap-3 md:px-6 md:py-3">
        <h1 className="mr-auto flex items-center gap-2.5 text-lg font-black md:mr-2 md:text-xl">
          <Logo />
          Pipeline
        </h1>
        <div className="relative order-3 w-full md:order-none md:w-auto md:max-w-md md:flex-1">
          <SearchIcon aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={recherche}
            type="search"
            aria-label="Rechercher un prospect"
            placeholder="Rechercher un nom, une société, un contact…"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            className="h-10 border-transparent bg-muted pr-9 pl-9 focus-visible:bg-card"
          />
          {texte && (
            <Button variant="ghost" size="icon-sm" className="absolute top-1/2 right-1.5 -translate-y-1/2" aria-label="Effacer la recherche" onClick={() => { setTexte(""); recherche.current?.focus() }}>
              <XIcon />
            </Button>
          )}
        </div>
        <div role="group" aria-label="Filtrer par relance" className="order-4 flex w-full gap-1.5 overflow-x-auto md:order-none md:w-auto">
          {FILTRES.map((f) => (
            <Button
              key={f.valeur}
              size="sm"
              variant={relance === f.valeur ? "default" : "outline"}
              aria-pressed={relance === f.valeur}
              className="h-8 shrink-0 rounded-full px-3 font-extrabold"
              onClick={() => setRelance(f.valeur)}
            >
              {f.libelle}
            </Button>
          ))}
        </div>
        <ThemeToggle />
        <Button className="h-10 px-3 font-extrabold md:px-4" onClick={() => setFiche({ creation: true, etape: mobile ? courante : "Nouveau" })}>
          <PlusIcon aria-hidden />
          <span className="max-md:sr-only">Nouveau prospect</span>
        </Button>
      </header>

      <BandeauRelances dues={dues} aujourdhui={aujourdhui} onOuvrir={ouvrir} onFaite={relanceFaite} />

      <nav aria-label="Étapes" className={cn("flex gap-1.5 overflow-x-auto px-4 pt-1 pb-2 md:hidden", glisse && "grid grid-cols-6 gap-1 overflow-visible")}>
        {ETAPES.map((e) => {
          const n = visibles.filter((p) => p.etape === e).length
          return (
            <button
              key={e}
              type="button"
              data-etape={e}
              data-cible-etape={e}
              aria-label={`Aller à ${e}, ${n} prospects`}
              aria-current={courante === e}
              onClick={() => aller(e)}
              className={cn(
                "flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[13px] font-extrabold transition-transform duration-200 aria-[current=true]:border-(--trait) aria-[current=true]:bg-(--c) aria-[current=true]:text-encre-fiche",
                glisse && "h-[52px] flex-col justify-center gap-0.5 rounded-[10px] border-(--trait) bg-(--c) px-0.5 text-[11px] text-encre-fiche",
                cible === e && "scale-105 ring-2 ring-(--trait)",
              )}
            >
              <i className="pastille-etape" aria-hidden />
              {glisse ? COURT[e] ?? e : e}
              {!glisse && <span>{n}</span>}
            </button>
          )
        })}
      </nav>

      <p id="aide-carte" className="sr-only">
        Entrée pour ouvrir la fiche. Maj et flèche gauche ou droite pour changer d&apos;étape.
      </p>

      <div
        ref={tableau}
        onScroll={() => {
          if (!mobile || !tableau.current) return
          const largeur = (tableau.current.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1
          const etape = ETAPES[Math.max(0, Math.min(5, Math.round(tableau.current.scrollLeft / (largeur + 12))))]
          if (etape !== courante) setCourante(etape)
        }}
        className="grid min-h-0 flex-1 snap-x snap-mandatory scroll-px-4 grid-cols-[repeat(6,calc(100%-28px))] grid-rows-[minmax(0,1fr)] gap-3 overflow-x-auto overscroll-x-contain px-4 pt-1.5 pb-4 md:snap-none md:grid-cols-[repeat(6,minmax(208px,1fr))] md:px-6 md:pt-2.5 md:pb-5"
      >
        {ETAPES.map((etape) => {
          const tous = prospects.filter((p) => p.etape === etape)
          const liste = visibles.filter((p) => p.etape === etape)
          const titre = `titre-${etape.replace(/\W/g, "")}`
          return (
            <section
              key={etape}
              data-colonne={etape}
              data-cible-etape={etape}
              data-etape={etape}
              aria-labelledby={titre}
              className={cn(
                "flex min-h-0 snap-start flex-col rounded-[14px] pb-2 transition-[background-color,box-shadow] duration-200",
                cible === etape && "bg-(--c)/40 shadow-[inset_0_0_0_2px_var(--trait)]",
              )}
            >
              <div className="flex items-center gap-2 px-2 pt-2 pb-2.5 font-black">
                <i className="pastille-etape" aria-hidden />
                <h2 id={titre} className="text-[15px] font-black">{etape}</h2>
                <span className="ml-auto text-[13px] font-extrabold text-muted-foreground" aria-label={`${liste.length} prospects`}>
                  {filtrage ? `${liste.length}/${tous.length}` : tous.length}
                </span>
              </div>
              <div className="flex min-h-14 shrink flex-col gap-2.5 overflow-y-auto px-1.5 pt-1.5 pb-2">
                {liste.map((p) => (
                  <CarteProspect
                    key={p.id}
                    prospect={p}
                    aujourdhui={aujourdhui}
                    source={glisse?.id === p.id}
                    onPointerDown={(e) => saisir(e, p.id, p.etape)}
                    onOuvrir={() => !vientDeGlisser() && ouvrir(p.id)}
                    onDeplacer={(sens) => {
                      const suivante = ETAPES[ETAPES.indexOf(p.etape) + sens]
                      if (!suivante) return
                      deplacer(p.id, suivante)
                      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-carte="${p.id}"]`)?.focus())
                    }}
                  />
                ))}
                {cible === etape && glisse && prospectGlisse?.etape !== etape && (
                  <div aria-hidden className="h-20 shrink-0 rounded-[6px_6px_16px_6px] border-2 border-dashed border-(--trait) bg-(--c)/50" />
                )}
                {liste.length === 0 && !(cible === etape && glisse) && (
                  <p className="rounded-[6px_6px_16px_6px] border-2 border-dashed border-input px-2 py-5 text-center text-[13px] font-bold text-muted-foreground">
                    {filtrage && tous.length ? "Aucun résultat ici" : "Glissez une fiche ici"}
                  </p>
                )}
              </div>
              <div className="px-1.5 pt-1">
                <AjoutRapide etape={etape} onAjouter={(nom, contact) => ajoutRapide(etape, nom, contact)} />
              </div>
            </section>
          )
        })}
      </div>

      {glisse && prospectGlisse && (
        <div ref={refVolante} aria-hidden className="pointer-events-none fixed top-0 left-0 z-50 origin-top-left" style={{ width: glisse.largeur }}>
          <CarteProspect prospect={prospectGlisse} aujourdhui={aujourdhui} volante />
        </div>
      )}

      <FicheProspect
        mode={ficheCourante}
        aujourdhui={aujourdhui}
        cote={mobile ? "bottom" : "right"}
        onFermer={() => setFiche(null)}
        ajouter={actions.ajouter}
        modifier={actions.modifier}
        onChangerEtape={(id, etape) => deplacer(id, etape)}
        onSupprimer={supprimer}
      />
      {/* Fiche ouverte : le toast monte au-dessus de sa barre d'actions. */}
      <Toaster position="bottom-center" offset={{ bottom: fiche ? 84 : 24 }} mobileOffset={{ bottom: fiche ? 84 : 16 }} />
    </div>
  )
}

function Logo() {
  return (
    <svg viewBox="0 0 26 26" className="size-6.5" aria-hidden>
      <rect x="2" y="4" width="10" height="9" rx="2" fill="var(--etape-contacte)" />
      <rect x="14" y="4" width="10" height="9" rx="2" fill="var(--etape-rdv)" />
      <rect x="2" y="15" width="10" height="8" rx="2" fill="var(--etape-reponse)" />
      <rect x="14" y="15" width="10" height="8" rx="2" fill="var(--etape-gagne)" />
      <rect x="18" y="1" width="7" height="5" rx="1.5" fill="var(--postit)" transform="rotate(8 21 3)" />
    </svg>
  )
}
