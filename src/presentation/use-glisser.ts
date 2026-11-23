"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Etape } from "@/service/prospect-service"

const SEUIL_SOURIS = 6
const APPUI_LONG = 280
const TOLERANCE_DOIGT = 10

type Suivi = {
  id: string
  source: Etape
  pointeur: number
  tactile: boolean
  x0: number
  y0: number
  dx: number
  dy: number
  largeur: number
  hauteur: number
  actif: boolean
  minuteur?: ReturnType<typeof setTimeout>
  x: number
  y: number
  defile: number
  boucle?: number
}

/**
 * Glisser-déposer des fiches entre étapes, à la souris, au stylet et au doigt
 * (appui long). Les zones de dépôt portent `data-cible-etape`.
 */
export function useGlisser({
  tableau,
  onDeposer,
}: {
  tableau: React.RefObject<HTMLElement | null>
  onDeposer: (id: string, etape: Etape) => void
}) {
  const [glisse, setGlisse] = useState<{ id: string; largeur: number; tactile: boolean } | null>(null)
  const [cible, setCible] = useState<Etape | null>(null)
  const suivi = useRef<Suivi | null>(null)
  const volante = useRef<HTMLDivElement | null>(null)
  const vientDeGlisser = useRef(false)
  const cibleCourante = useRef<Etape | null>(null)
  const deposer = useRef(onDeposer)
  useEffect(() => {
    deposer.current = onDeposer
  })

  const placer = useCallback(() => {
    const s = suivi.current
    const el = volante.current
    if (!s || !el) return
    const rotation = Math.max(-6, Math.min(6, 2.5 + (s.x - s.x0) * 0.04))
    el.style.transform = s.tactile
      ? `translate(${s.x - s.largeur * 0.3}px, ${s.y - s.hauteur * 0.6 - 36}px) rotate(${rotation}deg) scale(.6)`
      : `translate(${s.x - s.dx}px, ${s.y - s.dy}px) rotate(${rotation}deg) scale(1.03)`
  }, [])

  const refVolante = useCallback(
    (el: HTMLDivElement | null) => {
      volante.current = el
      placer()
    },
    [placer],
  )

  const viser = useCallback((x: number, y: number) => {
    const sous = document.elementFromPoint(x, y)
    let zone = sous?.closest<HTMLElement>("[data-cible-etape]")
    if (!zone && tableau.current?.contains(sous)) {
      // Sous une colonne courte : on vise la colonne à cette abscisse.
      zone = [...tableau.current.querySelectorAll<HTMLElement>("[data-colonne]")].find((c) => {
        const r = c.getBoundingClientRect()
        return x >= r.left && x <= r.right
      })
    }
    const etape = (zone?.dataset.cibleEtape ?? zone?.dataset.colonne ?? null) as Etape | null
    cibleCourante.current = etape
    setCible((c) => (c === etape ? c : etape))
    if (suivi.current && tableau.current) {
      const r = tableau.current.getBoundingClientRect()
      suivi.current.defile = x < r.left + 40 ? -14 : x > r.right - 40 ? 14 : 0
    }
  }, [tableau])

  const demarrer = useCallback(() => {
    const s = suivi.current
    if (!s) return
    s.actif = true
    setGlisse({ id: s.id, largeur: s.largeur, tactile: s.tactile })
    viser(s.x, s.y)
    const defiler = () => {
      if (!suivi.current?.actif) return
      if (suivi.current.defile && tableau.current) tableau.current.scrollLeft += suivi.current.defile
      suivi.current.boucle = requestAnimationFrame(defiler)
    }
    s.boucle = requestAnimationFrame(defiler)
  }, [tableau, viser])

  const terminer = useCallback((annule: boolean) => {
    const s = suivi.current
    suivi.current = null
    if (!s) return
    clearTimeout(s.minuteur)
    if (s.boucle) cancelAnimationFrame(s.boucle)
    if (!s.actif) return
    vientDeGlisser.current = true
    setTimeout(() => (vientDeGlisser.current = false), 0)
    const etape = cibleCourante.current
    cibleCourante.current = null
    setGlisse(null)
    setCible(null)
    if (!annule && etape && etape !== s.source) deposer.current(s.id, etape)
  }, [])

  useEffect(() => {
    const bouger = (e: PointerEvent) => {
      const s = suivi.current
      if (!s || e.pointerId !== s.pointeur) return
      s.x = e.clientX
      s.y = e.clientY
      const distance = Math.hypot(s.x - s.x0, s.y - s.y0)
      if (!s.actif) {
        if (s.tactile) {
          if (distance > TOLERANCE_DOIGT) terminer(true)
        } else if (distance > SEUIL_SOURIS) demarrer()
        return
      }
      e.preventDefault()
      placer()
      viser(s.x, s.y)
    }
    const lacher = (e: PointerEvent) => {
      if (suivi.current && e.pointerId === suivi.current.pointeur) terminer(false)
    }
    const annuler = (e: PointerEvent) => {
      if (suivi.current && e.pointerId === suivi.current.pointeur) terminer(true)
    }
    const bloquerDefilement = (e: TouchEvent) => {
      if (suivi.current?.actif) e.preventDefault()
    }
    const echap = (e: KeyboardEvent) => {
      if (e.key === "Escape" && suivi.current?.actif) terminer(true)
    }
    window.addEventListener("pointermove", bouger, { passive: false })
    window.addEventListener("pointerup", lacher)
    window.addEventListener("pointercancel", annuler)
    window.addEventListener("touchmove", bloquerDefilement, { passive: false })
    window.addEventListener("keydown", echap)
    return () => {
      window.removeEventListener("pointermove", bouger)
      window.removeEventListener("pointerup", lacher)
      window.removeEventListener("pointercancel", annuler)
      window.removeEventListener("touchmove", bloquerDefilement)
      window.removeEventListener("keydown", echap)
    }
  }, [demarrer, placer, terminer, viser])

  /** À brancher sur `onPointerDown` de chaque fiche. */
  const saisir = useCallback(
    (e: React.PointerEvent<HTMLElement>, id: string, source: Etape) => {
      if (e.button > 0) return
      const r = e.currentTarget.getBoundingClientRect()
      const tactile = e.pointerType === "touch"
      suivi.current = {
        id, source, pointeur: e.pointerId, tactile,
        x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY,
        dx: e.clientX - r.left, dy: e.clientY - r.top,
        largeur: r.width, hauteur: r.height, actif: false, defile: 0,
      }
      if (tactile) {
        suivi.current.minuteur = setTimeout(() => {
          navigator.vibrate?.(12)
          demarrer()
        }, APPUI_LONG)
      }
    },
    [demarrer],
  )

  return {
    glisse,
    cible,
    saisir,
    refVolante,
    /** Vrai juste après un dépôt : le clic qui suit ne doit pas ouvrir la fiche. */
    vientDeGlisser: () => vientDeGlisser.current,
  }
}
