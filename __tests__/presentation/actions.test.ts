import { beforeEach, describe, expect, it, vi } from "vitest"

const creerProspect = vi.fn()
const changerEtape = vi.fn()
const definirDateRelance = vi.fn()

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/service/default-prospect-service", () => ({
  obtenirServiceProspects: () => ({
    creerProspect,
    changerEtape,
    definirDateRelance,
  }),
}))

import {
  ajouterProspect,
  changerEtapeProspect,
  definirDateRelanceProspect,
} from "@/app/actions"

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

  it("renvoie l'erreur du service quand il refuse le changement", async () => {
    changerEtape.mockResolvedValue({ ok: false, erreur: "Prospect introuvable" })
    expect(await changerEtapeProspect("42", "RDV")).toEqual({
      erreur: "Prospect introuvable",
    })
  })

  it("renvoie un message clair si la base échoue", async () => {
    changerEtape.mockRejectedValue(new Error("SQLITE_BUSY"))
    expect(await changerEtapeProspect("42", "RDV")).toEqual({
      erreur: "Impossible de changer l'étape, réessayez.",
    })
  })
})

describe("validation des entrées de changerEtapeProspect (zod)", () => {
  beforeEach(() => {
    changerEtape.mockReset()
  })

  it("refuse une étape hors des 6 sans appeler le service", async () => {
    const etat = await changerEtapeProspect("42", "Archivé")
    expect(etat.erreur).toBeTruthy()
    expect(changerEtape).not.toHaveBeenCalled()
  })

  it("refuse un id vide ou qui n'est pas du texte sans appeler le service", async () => {
    for (const id of ["", "   ", 42, null, undefined, { a: 1 }]) {
      const etat = await changerEtapeProspect(id as unknown as string, "RDV")
      expect(etat.erreur).toBeTruthy()
    }
    expect(changerEtape).not.toHaveBeenCalled()
  })

  it("refuse une étape qui n'est pas du texte", async () => {
    const etat = await changerEtapeProspect("42", 7 as unknown as string)
    expect(etat.erreur).toBeTruthy()
    expect(changerEtape).not.toHaveBeenCalled()
  })
})

describe("validation des entrées de ajouterProspect (zod)", () => {
  beforeEach(() => {
    creerProspect.mockReset()
  })

  it("transmet au service des valeurs nettoyées des espaces", async () => {
    creerProspect.mockResolvedValue({ ok: true, prospect: {} })
    const formData = new FormData()
    formData.set("nom", "  Camille Durand ")
    formData.set("societe", " Acme ")
    formData.set("email", " c@exemple.fr ")
    formData.set("telephone", "")
    await ajouterProspect({}, formData)
    expect(creerProspect).toHaveBeenCalledWith({
      nom: "Camille Durand",
      societe: "Acme",
      email: "c@exemple.fr",
      telephone: "",
    })
  })

  it("traite un champ absent comme vide", async () => {
    creerProspect.mockResolvedValue({ ok: false, erreurs: { contact: "x" } })
    const formData = new FormData()
    formData.set("nom", "Camille")
    await ajouterProspect({}, formData)
    expect(creerProspect).toHaveBeenCalledWith({
      nom: "Camille",
      societe: "",
      email: "",
      telephone: "",
    })
  })

  it("refuse un champ qui n'est pas du texte (fichier) sans appeler le service", async () => {
    const formData = new FormData()
    formData.set("nom", new File(["x"], "x.txt"))
    formData.set("email", "c@exemple.fr")
    const etat = await ajouterProspect({}, formData)
    expect(etat.erreurGenerale).toBe("Saisie invalide, réessayez.")
    expect(creerProspect).not.toHaveBeenCalled()
  })
})

describe("action de date de relance", () => {
  beforeEach(() => {
    definirDateRelance.mockReset()
  })

  it("transmet l'id et la date au service et renvoie un état vide", async () => {
    definirDateRelance.mockResolvedValue({ ok: true, prospect: {} })
    expect(await definirDateRelanceProspect("42", "2026-11-23")).toEqual({})
    expect(definirDateRelance).toHaveBeenCalledWith("42", "2026-11-23")
  })

  it("transmet null au service pour une date vide (effacement)", async () => {
    definirDateRelance.mockResolvedValue({ ok: true, prospect: {} })
    await definirDateRelanceProspect("42", "  ")
    expect(definirDateRelance).toHaveBeenCalledWith("42", null)
  })

  it("renvoie l'erreur du service quand il refuse", async () => {
    definirDateRelance.mockResolvedValue({ ok: false, erreur: "Prospect introuvable" })
    expect(await definirDateRelanceProspect("42", "2026-11-23")).toEqual({
      erreur: "Prospect introuvable",
    })
  })

  it("renvoie un message clair si la base échoue", async () => {
    definirDateRelance.mockRejectedValue(new Error("SQLITE_BUSY"))
    expect(await definirDateRelanceProspect("42", "2026-11-23")).toEqual({
      erreur: "Impossible d'enregistrer la date, réessayez.",
    })
  })

  it("refuse une date mal formée sans appeler le service", async () => {
    for (const date of ["demain", "23/11/2026", "2026-11-23T10:00"]) {
      expect((await definirDateRelanceProspect("42", date)).erreur).toBeTruthy()
    }
    expect(definirDateRelance).not.toHaveBeenCalled()
  })

  it("refuse une date ou un id qui ne sont pas du texte sans appeler le service", async () => {
    const etats = [
      await definirDateRelanceProspect("42", 20261123 as unknown as string),
      await definirDateRelanceProspect(42 as unknown as string, "2026-11-23"),
      await definirDateRelanceProspect("", "2026-11-23"),
    ]
    for (const etat of etats) expect(etat.erreur).toBeTruthy()
    expect(definirDateRelance).not.toHaveBeenCalled()
  })
})
