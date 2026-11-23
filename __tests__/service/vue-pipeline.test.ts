import { describe, expect, it } from "vitest"
import type { Prospect } from "@/data/prospect"
import {
  analyserContact,
  ecartJours,
  estDue,
  filtrerProspects,
  relancesDues,
} from "@/service/vue-pipeline"

const AUJ = "2026-11-23"

const prospect = (champs: Partial<Prospect>): Prospect => ({
  id: champs.nom ?? "x",
  nom: "X",
  societe: null,
  email: null,
  telephone: null,
  etape: "Nouveau",
  dateRelance: null,
  notes: null,
  creeLe: "2026-11-01T10:00:00.000Z",
  ...champs,
})

describe("écart en jours", () => {
  it("compte les jours entre une date et aujourd'hui", () => {
    expect(ecartJours("2026-11-23", AUJ)).toBe(0)
    expect(ecartJours("2026-11-22", AUJ)).toBe(-1)
    expect(ecartJours("2025-11-23", AUJ)).toBe(-365)
    expect(ecartJours("2026-12-07", AUJ)).toBe(14)
  })

  it("traverse un changement d'heure sans erreur d'un jour", () => {
    expect(ecartJours("2026-10-24", "2026-10-26")).toBe(-2)
    expect(ecartJours("2026-03-28", "2026-03-30")).toBe(-2)
  })
})

describe("relance due", () => {
  it("est due aujourd'hui ou avant, pas après ni sans date", () => {
    expect(estDue(prospect({ dateRelance: AUJ }), AUJ)).toBe(true)
    expect(estDue(prospect({ dateRelance: "2026-11-22" }), AUJ)).toBe(true)
    expect(estDue(prospect({ dateRelance: "2026-11-24" }), AUJ)).toBe(false)
    expect(estDue(prospect({ dateRelance: null }), AUJ)).toBe(false)
  })

  it("liste exactement les relances dues, la plus ancienne d'abord", () => {
    const liste = [
      prospect({ nom: "Demain", dateRelance: "2026-11-24" }),
      prospect({ nom: "Auj", dateRelance: AUJ }),
      prospect({ nom: "Sans" }),
      prospect({ nom: "AnDernier", dateRelance: "2025-11-23" }),
      prospect({ nom: "Hier", dateRelance: "2026-11-22" }),
    ]
    expect(relancesDues(liste, AUJ).map((p) => p.nom)).toEqual([
      "AnDernier",
      "Hier",
      "Auj",
    ])
  })
})

describe("filtrer les prospects", () => {
  const liste = [
    prospect({ nom: "Inès Benali", societe: "Boulangerie du Coin", dateRelance: "2026-11-13" }),
    prospect({ nom: "Camille Durand", email: "camille@acme.fr", dateRelance: AUJ }),
    prospect({ nom: "Thomas Leroy", telephone: "06 12 34 56 78", dateRelance: "2026-11-24" }),
    prospect({ nom: "Paul Girard" }),
  ]
  const noms = (filtres: Parameters<typeof filtrerProspects>[1]) =>
    filtrerProspects(liste, filtres, AUJ).map((p) => p.nom)

  it("sans filtre, renvoie tout", () => {
    expect(noms({})).toHaveLength(4)
  })

  it("cherche dans le nom, la société, l'email et le téléphone, sans accent ni casse", () => {
    expect(noms({ texte: "INES" })).toEqual(["Inès Benali"])
    expect(noms({ texte: "boulang" })).toEqual(["Inès Benali"])
    expect(noms({ texte: "acme" })).toEqual(["Camille Durand"])
    expect(noms({ texte: "06 12" })).toEqual(["Thomas Leroy"])
    expect(noms({ texte: "  " })).toHaveLength(4)
  })

  it("filtre par relance : due, en retard, prévue, sans relance", () => {
    expect(noms({ relance: "due" })).toEqual(["Inès Benali", "Camille Durand"])
    expect(noms({ relance: "retard" })).toEqual(["Inès Benali"])
    expect(noms({ relance: "prevue" })).toEqual(["Thomas Leroy"])
    expect(noms({ relance: "aucune" })).toEqual(["Paul Girard"])
  })

  it("combine recherche et relance", () => {
    expect(noms({ texte: "camille", relance: "retard" })).toEqual([])
  })
})

describe("analyser un contact saisi en un seul champ", () => {
  it("reconnaît un email ou un téléphone", () => {
    expect(analyserContact(" zoe@test.fr ")).toEqual({ email: "zoe@test.fr", telephone: "" })
    expect(analyserContact("06 11 22 33 44")).toEqual({ email: "", telephone: "06 11 22 33 44" })
    expect(analyserContact("  ")).toEqual({ email: "", telephone: "" })
  })
})
