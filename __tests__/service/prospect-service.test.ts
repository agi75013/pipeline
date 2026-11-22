import { describe, expect, it } from "vitest"
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
