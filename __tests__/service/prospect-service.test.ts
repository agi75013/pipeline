import { describe, expect, it } from "vitest"
import { ETAPES } from "@/data/prospect"
import { createInMemoryProspectRepository } from "@/data/prospect-repository-memory"
import { createProspectService } from "@/service/prospect-service"

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

  it("signale un prospect introuvable", async () => {
    const service = nouveauService()
    const resultat = await service.changerEtape("inconnu", "RDV")
    expect(resultat).toEqual({ ok: false, erreur: expect.any(String) })
  })
})
