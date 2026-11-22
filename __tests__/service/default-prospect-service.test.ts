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
})
