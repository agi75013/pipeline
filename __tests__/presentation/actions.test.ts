import { beforeEach, describe, expect, it, vi } from "vitest"

const creerProspect = vi.fn()
const changerEtape = vi.fn()

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/service/default-prospect-service", () => ({
  obtenirServiceProspects: () => ({ creerProspect, changerEtape }),
}))

import { ajouterProspect, changerEtapeProspect } from "@/app/actions"

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

describe("action de changement d'étape", () => {
  beforeEach(() => {
    changerEtape.mockReset()
  })

  it("transmet l'id et l'étape au service et renvoie un état vide", async () => {
    changerEtape.mockResolvedValue({ ok: true, prospect: {} })
    expect(await changerEtapeProspect("42", "RDV")).toEqual({})
    expect(changerEtape).toHaveBeenCalledWith("42", "RDV")
  })

  it("renvoie l'erreur du service quand l'étape est refusée", async () => {
    changerEtape.mockResolvedValue({ ok: false, erreur: "Étape inconnue" })
    expect(await changerEtapeProspect("42", "Archivé")).toEqual({
      erreur: "Étape inconnue",
    })
  })

  it("renvoie un message clair si la base échoue", async () => {
    changerEtape.mockRejectedValue(new Error("SQLITE_BUSY"))
    expect(await changerEtapeProspect("42", "RDV")).toEqual({
      erreur: "Impossible de changer l'étape, réessayez.",
    })
  })
})
