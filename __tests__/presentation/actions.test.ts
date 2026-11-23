import { beforeEach, describe, expect, it, vi } from "vitest"

const creerProspect = vi.fn()

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/service/default-prospect-service", () => ({
  obtenirServiceProspects: () => ({ creerProspect }),
}))

import { ajouterProspect } from "@/app/actions"

const formulaire = () => {
  const formData = new FormData()
  formData.set("nom", "Camille Durand")
  formData.set("email", "c@exemple.fr")
  return formData
}

describe("action d'ajout", () => {
  beforeEach(() => {
    creerProspect.mockReset()
  })

  it("renvoie un message clair si la base échoue, sans perdre la saisie", async () => {
    creerProspect.mockImplementation(async () => {
      throw new Error("SQLITE_BUSY")
    })
    const etat = await ajouterProspect({}, formulaire())
    expect(etat.erreurGenerale).toBe("Impossible d'enregistrer, réessayez.")
    expect(etat.valeurs?.nom).toBe("Camille Durand")
  })

  it("renvoie un état vide quand l'ajout réussit", async () => {
    creerProspect.mockResolvedValue({ ok: true, prospect: {} })
    expect(await ajouterProspect({}, formulaire())).toEqual({})
  })
})
