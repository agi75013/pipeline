"use client"

import { CalendarIcon, MailIcon, PhoneIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { libelleRelance } from "@/presentation/libelles"
import type { Prospect } from "@/service/prospect-service"
import { ecartJours, estDue } from "@/service/vue-pipeline"

type Props = {
  prospect: Prospect
  aujourdhui: string
  volante?: boolean
  source?: boolean
  onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void
  onOuvrir?: () => void
  onDeplacer?: (sens: 1 | -1) => void
}

/** Une fiche post-it : nom, société, contact, et l'étiquette rouge si la relance est due. */
export function CarteProspect({ prospect: p, aujourdhui, volante, source, onPointerDown, onOuvrir, onDeplacer }: Props) {
  const due = estDue(p, aujourdhui)
  const relance = p.dateRelance ? libelleRelance(p.dateRelance, ecartJours(p.dateRelance, aujourdhui)) : null
  const etat = relance ? `relance ${relance.long.toLowerCase()}` : "sans relance"
  return (
    <button
      type="button"
      data-carte={p.id}
      data-etape={p.etape}
      tabIndex={volante ? -1 : undefined}
      aria-hidden={volante || undefined}
      aria-label={`${p.nom}${p.societe ? `, ${p.societe}` : ""}, ${etat}`}
      aria-describedby={volante ? undefined : "aide-carte"}
      onPointerDown={onPointerDown}
      onClick={onOuvrir}
      onKeyDown={(e) => {
        if (!e.shiftKey || !onDeplacer) return
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault()
          onDeplacer(e.key === "ArrowRight" ? 1 : -1)
        }
      }}
      className={cn(
        "relative block w-full cursor-grab touch-manipulation rounded-[6px_6px_16px_6px] bg-(--c) px-3 pt-3 pb-2.5 text-left text-encre-fiche shadow-fiche transition-[box-shadow,opacity,transform] duration-200 select-none outline-offset-3 hover:shadow-fiche-survol focus-visible:outline-2 focus-visible:outline-foreground",
        p.etape === "Nouveau" && "ring-1 ring-border ring-inset",
        source && "opacity-25",
        volante && "pointer-events-none cursor-grabbing shadow-levee",
      )}
    >
      {due && relance && (
        <span className="absolute -top-2 right-2.5 rotate-3 rounded-[4px_4px_8px_4px] bg-postit px-2 py-0.5 text-xs font-black text-postit-foreground shadow-postit">
          {relance.court}
        </span>
      )}
      <b className="block pr-14 font-extrabold leading-tight [overflow-wrap:anywhere]">{p.nom}</b>
      {p.societe && (
        <span className="mt-0.5 block text-[13px] font-bold text-encre-fiche-2 [overflow-wrap:anywhere]">{p.societe}</span>
      )}
      <span className="mt-2 flex items-center gap-1.5 overflow-hidden text-[13px] text-encre-fiche-2">
        {p.email ? <MailIcon className="size-3.5 shrink-0" aria-hidden /> : <PhoneIcon className="size-3.5 shrink-0" aria-hidden />}
        <span className="truncate">{p.email ?? p.telephone}</span>
      </span>
      {relance && !due && (
        <span className="mt-1.5 flex items-center gap-1.5 text-[13px] text-encre-fiche-2">
          <CalendarIcon className="size-3.5 shrink-0" aria-hidden />
          <span>Relance {relance.long.toLowerCase()}</span>
        </span>
      )}
    </button>
  )
}
