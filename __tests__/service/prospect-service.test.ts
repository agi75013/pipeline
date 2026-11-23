import { describe, expect, it, vi } from "vitest"
import { ETAPES } from "@/data/prospect"
import { createInMemoryProspectRepository } from "@/data/prospect-repository-memory"
import {
  createProspectService,
  type ProspectService,
} from "@/service/prospect-service"

function nouveauService() {
  return createProspectService(createInMemoryProspectRepository())
}

describe("créer un prospect", () => {
  it("ajoute Camille Durand avec un email, à l'étape Nouveau", async () => {
    const service = nouveauService()
    const resultat = await service.creerProspect({
      nom: "Camille Durand",
      email: "camille@exemple.fr",
    })
    expect(resultat.ok).toBe(true)
    const liste = await service.listerProspects()
    expect(liste).toHaveLength(1)
    expect(liste[0]).toMatchObject({ nom: "Camille Durand", etape: "Nouveau" })
  })

  it("accepte un téléphone seul", async () => {
    const service = nouveauService()
    const resultat = await service.creerProspect({
      nom: "Camille",
      telephone: "0102030405",
    })
    expect(resultat.ok).toBe(true)
  })

  it("la société est facultative (stockée à null)", async () => {
    const service = nouveauService()
    await service.creerProspect({ nom: "Camille", email: "c@exemple.fr" })
    expect((await service.listerProspects())[0].societe).toBeNull()
  })

  it("nettoie les espaces autour des champs", async () => {
    const service = nouveauService()
    await service.creerProspect({
      nom: "  Camille  ",
      societe: " Acme ",
      email: " c@exemple.fr ",
    })
    expect((await service.listerProspects())[0]).toMatchObject({
      nom: "Camille",
      societe: "Acme",
      email: "c@exemple.fr",
    })
  })

  it("force l'étape Nouveau même si la saisie en fournit une autre", async () => {
    const service = nouveauService()
    await service.creerProspect({
      nom: "Camille",
      email: "c@exemple.fr",
      etape: "Gagné",
    } as never)
    expect((await service.listerProspects())[0].etape).toBe("Nouveau")
  })
})

describe("refus de saisie", () => {
  it("refuse sans email ni téléphone, avec un message qui dit quoi corriger", async () => {
    const service = nouveauService()
    const resultat = await service.creerProspect({ nom: "Camille" })
    expect(resultat).toEqual({
      ok: false,
      erreurs: { contact: "Renseignez un email ou un téléphone" },
    })
    expect(await service.listerProspects()).toEqual([])
  })

  it("considère des espaces seuls comme vides", async () => {
    const service = nouveauService()
    const resultat = await service.creerProspect({
      nom: "Camille",
      email: "   ",
      telephone: "  ",
    })
    expect(resultat.ok).toBe(false)
    expect(await service.listerProspects()).toEqual([])
  })

  it("refuse sans nom", async () => {
    const service = nouveauService()
    const resultat = await service.creerProspect({ email: "c@exemple.fr" })
    expect(resultat).toEqual({
      ok: false,
      erreurs: { nom: "Le nom est obligatoire" },
    })
    expect(await service.listerProspects()).toEqual([])
  })

  it("refuse un nom d'espaces seuls", async () => {
    const service = nouveauService()
    const resultat = await service.creerProspect({
      nom: "   ",
      email: "c@exemple.fr",
    })
    expect(resultat.ok).toBe(false)
  })

  it("signale ensemble le nom et le contact manquants", async () => {
    const service = nouveauService()
    const resultat = await service.creerProspect({})
    expect(resultat).toEqual({
      ok: false,
      erreurs: {
        nom: "Le nom est obligatoire",
        contact: "Renseignez un email ou un téléphone",
      },
    })
  })
})

describe("changer l'étape d'un prospect", () => {
  async function serviceAvecCamille() {
    const service = nouveauService()
    const creation = await service.creerProspect({
      nom: "Camille Durand",
      email: "camille@exemple.fr",
    })
    if (!creation.ok) throw new Error("création impossible")
    return { service, id: creation.prospect.id }
  }

  it("passe un prospect de Nouveau à RDV, la liste affiche RDV", async () => {
    const { service, id } = await serviceAvecCamille()
    const resultat = await service.changerEtape(id, "RDV")
    expect(resultat.ok).toBe(true)
    expect((await service.listerProspects())[0].etape).toBe("RDV")
  })

  it("accepte le retour de Gagné à Contacté", async () => {
    const { service, id } = await serviceAvecCamille()
    await service.changerEtape(id, "Gagné")
    const resultat = await service.changerEtape(id, "Contacté")
    expect(resultat.ok).toBe(true)
    expect((await service.listerProspects())[0].etape).toBe("Contacté")
  })

  it("accepte le passage libre entre les 6 étapes, dans tous les sens", async () => {
    const { service, id } = await serviceAvecCamille()
    for (const depart of ETAPES) {
      for (const arrivee of ETAPES) {
        await service.changerEtape(id, depart)
        const resultat = await service.changerEtape(id, arrivee)
        expect(resultat.ok).toBe(true)
        expect((await service.listerProspects())[0].etape).toBe(arrivee)
      }
    }
  })

  it("refuse une étape hors des 6 et laisse l'étape inchangée", async () => {
    const { service, id } = await serviceAvecCamille()
    const resultat = await service.changerEtape(id, "Archivé")
    expect(resultat).toEqual({ ok: false, erreur: expect.any(String) })
    expect((await service.listerProspects())[0].etape).toBe("Nouveau")
  })

  it("refuse une étape vide", async () => {
    const { service, id } = await serviceAvecCamille()
    expect((await service.changerEtape(id, "")).ok).toBe(false)
  })

  it("refuse un id vide ou qui n'est pas du texte, sans appeler la base", async () => {
    const depot = {
      ...createInMemoryProspectRepository(),
      changerEtape: vi.fn(),
    }
    const service = createProspectService(depot)
    for (const id of ["", "   ", 42, null, undefined, { a: 1 }]) {
      const resultat = await service.changerEtape(id as unknown as string, "RDV")
      expect(resultat).toEqual({ ok: false, erreur: "Prospect introuvable" })
    }
    expect(depot.changerEtape).not.toHaveBeenCalled()
  })

  it("signale un prospect introuvable", async () => {
    const service = nouveauService()
    const resultat = await service.changerEtape("inconnu", "RDV")
    expect(resultat).toEqual({ ok: false, erreur: expect.any(String) })
  })
})

describe("voir qui relancer aujourd'hui", () => {
  const AUJOURDHUI = "2026-11-23"

  async function serviceAvec(relances: Record<string, string | null>) {
    const service = createProspectService(createInMemoryProspectRepository(), {
      aujourdhui: () => AUJOURDHUI,
    })
    for (const [nom, date] of Object.entries(relances)) {
      const creation = await service.creerProspect({ nom, email: "x@exemple.fr" })
      if (!creation.ok) throw new Error("création impossible")
      if (date) await service.definirDateRelance(creation.prospect.id, date)
    }
    return service
  }

  const nomsARelancer = async (service: ProspectService) =>
    (await service.listerARelancer()).map((p) => p.nom)

  it("inclut un prospect avec relance aujourd'hui", async () => {
    const service = await serviceAvec({ Aujourdhui: AUJOURDHUI })
    expect(await nomsARelancer(service)).toEqual(["Aujourdhui"])
  })

  it("inclut un prospect avec relance hier", async () => {
    const service = await serviceAvec({ Hier: "2026-11-22" })
    expect(await nomsARelancer(service)).toEqual(["Hier"])
  })

  it("exclut un prospect avec relance demain", async () => {
    const service = await serviceAvec({ Demain: "2026-11-24" })
    expect(await nomsARelancer(service)).toEqual([])
  })

  it("exclut un prospect sans date de relance", async () => {
    const service = await serviceAvec({ Sans: null })
    expect(await nomsARelancer(service)).toEqual([])
  })

  it("contient exactement les relances dues, la plus ancienne en premier", async () => {
    const service = await serviceAvec({
      Demain: "2026-11-24",
      Aujourdhui: AUJOURDHUI,
      Sans: null,
      MoisDernier: "2026-10-23",
      AnDernier: "2025-12-31",
    })
    expect(await nomsARelancer(service)).toEqual([
      "AnDernier",
      "MoisDernier",
      "Aujourdhui",
    ])
  })

  it("utilise la date fournie par l'horloge, pas une date en dur", async () => {
    let jour = "2026-11-23"
    const service = createProspectService(createInMemoryProspectRepository(), {
      aujourdhui: () => jour,
    })
    const creation = await service.creerProspect({ nom: "A", email: "a@exemple.fr" })
    if (!creation.ok) throw new Error("création impossible")
    await service.definirDateRelance(creation.prospect.id, "2026-11-24")
    expect(await service.listerARelancer()).toEqual([])
    jour = "2026-11-24"
    expect(await service.listerARelancer()).toHaveLength(1)
  })
})

describe("saisir une date de relance", () => {
  async function serviceAvecCamille() {
    const service = nouveauService()
    const creation = await service.creerProspect({
      nom: "Camille",
      email: "c@exemple.fr",
    })
    if (!creation.ok) throw new Error("création impossible")
    return { service, id: creation.prospect.id }
  }

  it("enregistre la date de relance", async () => {
    const { service, id } = await serviceAvecCamille()
    const resultat = await service.definirDateRelance(id, "2026-12-01")
    expect(resultat.ok).toBe(true)
    expect((await service.listerProspects())[0].dateRelance).toBe("2026-12-01")
  })

  it("efface la date de relance avec null", async () => {
    const { service, id } = await serviceAvecCamille()
    await service.definirDateRelance(id, "2026-12-01")
    expect((await service.definirDateRelance(id, null)).ok).toBe(true)
    expect((await service.listerProspects())[0].dateRelance).toBeNull()
  })

  it("refuse une date mal formée ou impossible", async () => {
    const { service, id } = await serviceAvecCamille()
    for (const date of ["demain", "2026-13-01", "2026-02-30", "01/12/2026", ""]) {
      const resultat = await service.definirDateRelance(id, date)
      expect(resultat).toEqual({ ok: false, erreur: expect.any(String) })
    }
    expect((await service.listerProspects())[0].dateRelance).toBeNull()
  })

  it("signale un prospect introuvable", async () => {
    const service = nouveauService()
    const resultat = await service.definirDateRelance("inconnu", "2026-12-01")
    expect(resultat).toEqual({ ok: false, erreur: "Prospect introuvable" })
  })
})
