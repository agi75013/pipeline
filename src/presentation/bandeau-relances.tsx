"use client"

import { useState } from "react"
import { CheckIcon, ChevronDownIcon, PartyPopperIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { libelleRelance } from "@/presentation/libelles"
import type { Prospect } from "@/service/prospect-service"
import { ecartJours } from "@/service/vue-pipeline"

const INCLINAISONS = ["-rotate-1", "rotate-1", "-rotate-[0.6deg]", "rotate-[1.1deg]", "-rotate-[0.9deg]"]

/** Bandeau des relances dues : un post-it rouge par prospect, le plus en retard d'abord. */
export function BandeauRelances({
  dues,
  aujourdhui,
  onOuvrir,
  onFaite,
}: {
  dues: Prospect[]
  aujourdhui: string
  onOuvrir: (id: string) => void
  onFaite: (id: string) => void
}) {
  const [replie, setReplie] = useState(false)
  return (
    <section aria-labelledby="titre-relances" className="flex flex-col gap-0 px-4 pt-3 md:flex-row md:items-center md:gap-3 md:px-6 md:pt-3.5">
      <h2 id="titre-relances" className="shrink-0 text-[15px] font-black">
        <button
          type="button"
          aria-expanded={!replie}
          aria-controls="liste-relances"
          onClick={() => setReplie((r) => !r)}
          className="flex items-center gap-2 py-1 md:pointer-events-none"
        >
          À relancer
          <span className="inline-grid h-6 min-w-6 place-items-center rounded-full bg-postit px-1.5 text-[13px] text-postit-foreground">
            {dues.length}
          </span>
          <ChevronDownIcon
            aria-hidden
            className={cn("size-4 transition-transform duration-300 ease-sortie md:hidden", replie && "-rotate-90")}
          />
        </button>
      </h2>
      <ul
        id="liste-relances"
        className={cn(
          "m-0 flex list-none gap-2.5 overflow-x-auto px-1 pt-2 pb-2.5 snap-x snap-proximity",
          replie && "max-md:hidden",
        )}
      >
        {dues.length === 0 ? (
          <li className="flex items-center gap-2 font-bold text-muted-foreground">
            <PartyPopperIcon className="size-4" aria-hidden />
            Aucune relance due aujourd&apos;hui.
          </li>
        ) : (
          dues.map((p, i) => {
            const libelle = libelleRelance(p.dateRelance!, ecartJours(p.dateRelance!, aujourdhui)).long
            return (
              <li
                key={p.id}
                className={cn(
                  "flex shrink-0 snap-start items-center gap-1 rounded-[6px_6px_12px_6px] bg-postit text-postit-foreground shadow-postit transition-transform duration-300 ease-sortie hover:-translate-y-0.5 hover:rotate-0",
                  INCLINAISONS[i % INCLINAISONS.length],
                )}
              >
                <button
                  type="button"
                  onClick={() => onOuvrir(p.id)}
                  aria-label={`Ouvrir ${p.nom}, ${libelle.toLowerCase()}, ${p.etape}`}
                  className="py-2 pr-1 pl-3 text-left leading-tight"
                >
                  <span className="block font-extrabold">{p.nom}</span>
                  <span className="text-[13px] font-bold">
                    {libelle} · {p.etape}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-1.5 text-postit-foreground hover:bg-postit-foreground/15"
                  aria-label={`Relance faite pour ${p.nom}`}
                  title="Relance faite"
                  onClick={() => onFaite(p.id)}
                >
                  <CheckIcon />
                </Button>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}
