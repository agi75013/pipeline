import { beforeEach, describe, expect, it, vi } from "vitest"

const creerProspect = vi.fn()
const changerEtape = vi.fn()
const definirDateRelance = vi.fn()
const modifierProspect = vi.fn()
const supprimerProspect = vi.fn()
const creerProspectRapide = vi.fn()

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/service/default-prospect-service", () => ({
  obtenirServiceProspects: () => ({
    creerProspect,
    changerEtape,
    definirDateRelance,
    modifierProspect,
    supprimerProspect,
    creerProspectRapide,
  }),
}))

import {
  ajouterProspect,
  changerEtapeProspect,
  definirDateRelanceProspect,
  modifierProspect as modifierProspectAction,
  supprimerProspect as supprimerProspectAction,
  ajoutRapideProspect,
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

  it("signale le succès quand l'ajout réussit", async () => {
    creerProspect.mockResolvedValue({ ok: true, prospect: {} })
    expect(await ajouterProspect({}, formulaire())).toEqual({ succes: true })
  })

  it("transmet l'étape choisie, la date de relance et les notes", async () => {
    creerProspect.mockResolvedValue({ ok: true, prospect: {} })
    const formData = formulaire()
    formData.set("etape", "RDV")
    formData.set("dateRelance", "2026-12-01")
    formData.set("notes", " Rappeler ")
    await ajouterProspect({}, formData)
    expect(creerProspect).toHaveBeenCalledWith(
      expect.objectContaining({ dateRelance: "2026-12-01", notes: "Rappeler" }),
      { etape: "RDV" },
    )
  })

  it("refuse une étape hors des 6 ou une date mal formée sans appeler le service", async () => {
    const etapeFausse = formulaire()
    etapeFausse.set("etape", "Archivé")
    const dateFausse = formulaire()
    dateFausse.set("dateRelance", "01/12/2026")
    for (const formData of [etapeFausse, dateFausse]) {
      expect((await ajouterProspect({}, formData)).erreurGenerale).toBe(
        "Saisie invalide, réessayez.",
      )
    }
    expect(creerProspect).not.toHaveBeenCalled()
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
    expect(creerProspect).toHaveBeenCalledWith(
      {
        nom: "Camille Durand",
        societe: "Acme",
        email: "c@exemple.fr",
        telephone: "",
        dateRelance: "",
        notes: "",
      },
      { etape: "Nouveau" },
    )
  })

  it("traite un champ absent comme vide", async () => {
    creerProspect.mockResolvedValue({ ok: false, erreurs: { contact: "x" } })
    const formData = new FormData()
    formData.set("nom", "Camille")
    await ajouterProspect({}, formData)
    expect(creerProspect).toHaveBeenCalledWith(
      {
        nom: "Camille",
        societe: "",
        email: "",
        telephone: "",
        dateRelance: "",
        notes: "",
      },
      { etape: "Nouveau" },
    )
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

describe("action de modification", () => {
  beforeEach(() => {
    modifierProspect.mockReset()
  })

  const formulaireComplet = () => {
    const formData = new FormData()
    formData.set("nom", " Camille Durand ")
    formData.set("societe", "Nouvelle Société")
    formData.set("email", "c@exemple.fr")
    formData.set("telephone", "")
    formData.set("dateRelance", "2026-11-23")
    formData.set("notes", " Rappeler en janvier ")
    return formData
  }

  it("transmet l'id et la saisie nettoyée au service, et signale le succès", async () => {
    modifierProspect.mockResolvedValue({ ok: true, prospect: {} })
    const etat = await modifierProspectAction("42", {}, formulaireComplet())
    expect(etat).toEqual({ succes: true })
    expect(modifierProspect).toHaveBeenCalledWith("42", {
      nom: "Camille Durand",
      societe: "Nouvelle Société",
      email: "c@exemple.fr",
      telephone: "",
      dateRelance: "2026-11-23",
      notes: "Rappeler en janvier",
    })
  })

  it("renvoie les erreurs du service avec la saisie", async () => {
    modifierProspect.mockResolvedValue({
      ok: false,
      erreurs: { contact: "Renseignez un email ou un téléphone" },
    })
    const etat = await modifierProspectAction("42", {}, formulaireComplet())
    expect(etat.erreurs).toEqual({ contact: "Renseignez un email ou un téléphone" })
    expect(etat.valeurs?.notes).toBe("Rappeler en janvier")
  })

  it("renvoie l'erreur de prospect introuvable en message général", async () => {
    modifierProspect.mockResolvedValue({
      ok: false,
      erreurs: { prospect: "Prospect introuvable" },
    })
    const etat = await modifierProspectAction("42", {}, formulaireComplet())
    expect(etat.erreurGenerale).toBe("Prospect introuvable")
  })

  it("renvoie un message clair si la base échoue, sans perdre la saisie", async () => {
    modifierProspect.mockRejectedValue(new Error("SQLITE_BUSY"))
    const etat = await modifierProspectAction("42", {}, formulaireComplet())
    expect(etat.erreurGenerale).toBe("Impossible d'enregistrer, réessayez.")
    expect(etat.valeurs?.societe).toBe("Nouvelle Société")
  })

  it("traite les champs absents comme vides", async () => {
    modifierProspect.mockResolvedValue({ ok: true, prospect: {} })
    const formData = new FormData()
    formData.set("nom", "Camille")
    await modifierProspectAction("42", {}, formData)
    expect(modifierProspect).toHaveBeenCalledWith("42", {
      nom: "Camille",
      societe: "",
      email: "",
      telephone: "",
      dateRelance: "",
      notes: "",
    })
  })

  it("refuse un id vide ou qui n'est pas du texte sans appeler le service", async () => {
    for (const id of ["", "  ", 42, null]) {
      const etat = await modifierProspectAction(
        id as unknown as string,
        {},
        formulaireComplet(),
      )
      expect(etat.erreurGenerale).toBeTruthy()
    }
    expect(modifierProspect).not.toHaveBeenCalled()
  })

  it("refuse une date mal formée ou un champ fichier sans appeler le service", async () => {
    const dateFausse = formulaireComplet()
    dateFausse.set("dateRelance", "23/11/2026")
    const fichier = formulaireComplet()
    fichier.set("notes", new File(["x"], "x.txt"))
    for (const formData of [dateFausse, fichier]) {
      const etat = await modifierProspectAction("42", {}, formData)
      expect(etat.erreurGenerale).toBe("Saisie invalide, réessayez.")
    }
    expect(modifierProspect).not.toHaveBeenCalled()
  })
})

describe("action de suppression", () => {
  beforeEach(() => {
    supprimerProspect.mockReset()
  })

  it("transmet l'id au service et renvoie un état vide", async () => {
    supprimerProspect.mockResolvedValue({ ok: true })
    expect(await supprimerProspectAction(" 42 ")).toEqual({})
    expect(supprimerProspect).toHaveBeenCalledWith("42")
  })

  it("renvoie l'erreur du service quand il refuse", async () => {
    supprimerProspect.mockResolvedValue({ ok: false, erreur: "Prospect introuvable" })
    expect(await supprimerProspectAction("42")).toEqual({
      erreur: "Prospect introuvable",
    })
  })

  it("renvoie un message clair si la base échoue", async () => {
    supprimerProspect.mockRejectedValue(new Error("SQLITE_BUSY"))
    expect(await supprimerProspectAction("42")).toEqual({
      erreur: "Impossible de supprimer, réessayez.",
    })
  })

  it("refuse un id vide ou qui n'est pas du texte sans appeler le service", async () => {
    for (const id of ["", "   ", 42, null, undefined, { a: 1 }]) {
      const etat = await supprimerProspectAction(id as unknown as string)
      expect(etat.erreur).toBeTruthy()
    }
    expect(supprimerProspect).not.toHaveBeenCalled()
  })
})

describe("action d'ajout rapide dans une colonne", () => {
  beforeEach(() => {
    creerProspectRapide.mockReset()
  })

  it("transmet étape, nom et contact nettoyés, et renvoie l'id créé", async () => {
    creerProspectRapide.mockResolvedValue({ ok: true, prospect: { id: "99" } })
    expect(await ajoutRapideProspect("RDV", " Zoé ", " zoe@test.fr ")).toEqual({ id: "99" })
    expect(creerProspectRapide).toHaveBeenCalledWith("RDV", "Zoé", "zoe@test.fr")
  })

  it("renvoie les erreurs de saisie du service", async () => {
    creerProspectRapide.mockResolvedValue({
      ok: false,
      erreurs: { nom: "Le nom est obligatoire" },
    })
    expect(await ajoutRapideProspect("RDV", "", "x")).toEqual({
      erreurs: { nom: "Le nom est obligatoire" },
    })
  })

  it("renvoie un message clair si la base échoue", async () => {
    creerProspectRapide.mockRejectedValue(new Error("SQLITE_BUSY"))
    expect(await ajoutRapideProspect("RDV", "Zoé", "z@t.fr")).toEqual({
      erreurGenerale: "Impossible d'enregistrer, réessayez.",
    })
  })

  it("refuse une étape hors des 6 ou des valeurs qui ne sont pas du texte sans appeler le service", async () => {
    const etats = [
      await ajoutRapideProspect("Archivé", "Zoé", "z@t.fr"),
      await ajoutRapideProspect("RDV", 42 as unknown as string, "z@t.fr"),
      await ajoutRapideProspect("RDV", "Zoé", null as unknown as string),
    ]
    for (const etat of etats) expect(etat.erreurGenerale).toBeTruthy()
    expect(creerProspectRapide).not.toHaveBeenCalled()
  })
})
