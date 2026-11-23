// @vitest-environment node
import { describe, expect, it } from "vitest"
import { obtenirServiceProspects } from "@/service/default-prospect-service"

describe("service de prospects câblé sur la base", () => {
  it("ajoute puis liste un prospect via la base configurée", async () => {
    process.env.DATABASE_URL = ":memory:"
    const service = obtenirServiceProspects()
    await service.creerProspect({ nom: "Camille", email: "c@exemple.fr" })
    expect((await service.listerProspects()).map((p) => p.nom)).toEqual([
      "Camille",
    ])
  })

  it("change l'étape d'un prospect via la base configurée", async () => {
    process.env.DATABASE_URL = ":memory:"
    const service = obtenirServiceProspects()
    const creation = await service.creerProspect({
      nom: "Alex",
      email: "a@exemple.fr",
    })
    if (!creation.ok) throw new Error("création impossible")
    const resultat = await service.changerEtape(creation.prospect.id, "RDV")
    expect(resultat.ok).toBe(true)
    const liste = await service.listerProspects()
    expect(liste.find((p) => p.id === creation.prospect.id)?.etape).toBe("RDV")
  })
})
