// @vitest-environment node
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, it } from "vitest"
import type { Etape, NouveauProspect } from "@/data/prospect"
import { createInMemoryProspectRepository } from "@/data/prospect-repository-memory"
import { createSqliteProspectRepository } from "@/data/prospect-repository-sqlite"

const dossier = mkdtempSync(join(tmpdir(), "pipeline-test-"))
afterAll(() => rmSync(dossier, { recursive: true, force: true }))

let compteur = 0
const urlTemporaire = () => `file:${join(dossier, `base-${compteur++}.db`)}`

const camille: NouveauProspect = {
  nom: "Camille Durand",
  societe: null,
  email: "camille@exemple.fr",
  telephone: null,
  etape: "Nouveau",
}

const depots = [
  ["mémoire", async () => createInMemoryProspectRepository()],
  ["SQLite", async () => createSqliteProspectRepository(urlTemporaire())],
] as const

describe.each(depots)("dépôt de prospects (%s)", (_nom, creer) => {
  it("ajoute un prospect avec un id et une date de création", async () => {
    const depot = await creer()
    const ajoute = await depot.ajouter(camille)
    expect(ajoute).toMatchObject(camille)
    expect(ajoute.id).toBeTruthy()
    expect(Number.isNaN(Date.parse(ajoute.creeLe))).toBe(false)
  })

  it("liste le prospect ajouté, champs absents à null", async () => {
    const depot = await creer()
    await depot.ajouter(camille)
    const liste = await depot.lister()
    expect(liste).toHaveLength(1)
    expect(liste[0]).toMatchObject({
      nom: "Camille Durand",
      societe: null,
      telephone: null,
      etape: "Nouveau",
      dateRelance: null,
      notes: null,
    })
  })

  it("liste le plus récent en premier", async () => {
    const depot = await creer()
    await depot.ajouter({ ...camille, nom: "Premier" })
    await new Promise((r) => setTimeout(r, 5))
    await depot.ajouter({ ...camille, nom: "Second" })
    const noms = (await depot.lister()).map((p) => p.nom)
    expect(noms).toEqual(["Second", "Premier"])
  })

  it("renvoie une liste vide au départ", async () => {
    const depot = await creer()
    expect(await depot.lister()).toEqual([])
  })

  it("change l'étape d'un prospect et renvoie le prospect mis à jour", async () => {
    const depot = await creer()
    const ajoute = await depot.ajouter(camille)
    const modifie = await depot.changerEtape(ajoute.id, "RDV")
    expect(modifie).toMatchObject({ id: ajoute.id, etape: "RDV" })
    expect((await depot.lister())[0].etape).toBe("RDV")
  })

  it("ne touche pas aux autres prospects", async () => {
    const depot = await creer()
    const a = await depot.ajouter({ ...camille, nom: "A" })
    await depot.ajouter({ ...camille, nom: "B" })
    await depot.changerEtape(a.id, "Gagné")
    const etapes = Object.fromEntries(
      (await depot.lister()).map((p) => [p.nom, p.etape]),
    )
    expect(etapes).toEqual({ A: "Gagné", B: "Nouveau" })
  })

  it("renvoie null pour un id inconnu", async () => {
    const depot = await creer()
    expect(await depot.changerEtape("inconnu", "RDV")).toBeNull()
  })

  it("enregistre puis efface une date de relance", async () => {
    const depot = await creer()
    const ajoute = await depot.ajouter(camille)
    const modifie = await depot.definirDateRelance(ajoute.id, "2026-12-01")
    expect(modifie).toMatchObject({ id: ajoute.id, dateRelance: "2026-12-01" })
    expect((await depot.lister())[0].dateRelance).toBe("2026-12-01")
    await depot.definirDateRelance(ajoute.id, null)
    expect((await depot.lister())[0].dateRelance).toBeNull()
  })

  it("renvoie null pour une date de relance sur un id inconnu", async () => {
    const depot = await creer()
    expect(await depot.definirDateRelance("inconnu", "2026-12-01")).toBeNull()
  })
})

describe("dépôt SQLite", () => {
  it("retrouve les prospects après redémarrage (même fichier, nouveau dépôt)", async () => {
    const url = urlTemporaire()
    const avant = await createSqliteProspectRepository(url)
    await avant.ajouter(camille)
    await avant.fermer()

    const apres = await createSqliteProspectRepository(url)
    const liste = await apres.lister()
    await apres.fermer()
    expect(liste.map((p) => p.nom)).toEqual(["Camille Durand"])
  })

  it("conserve la nouvelle étape après redémarrage", async () => {
    const url = urlTemporaire()
    const avant = await createSqliteProspectRepository(url)
    const ajoute = await avant.ajouter(camille)
    await avant.changerEtape(ajoute.id, "RDV")
    await avant.fermer()

    const apres = await createSqliteProspectRepository(url)
    const liste = await apres.lister()
    await apres.fermer()
    expect(liste[0].etape).toBe("RDV")
  })

  it("conserve la date de relance après redémarrage", async () => {
    const url = urlTemporaire()
    const avant = await createSqliteProspectRepository(url)
    const ajoute = await avant.ajouter(camille)
    await avant.definirDateRelance(ajoute.id, "2026-12-01")
    await avant.fermer()

    const apres = await createSqliteProspectRepository(url)
    const liste = await apres.lister()
    await apres.fermer()
    expect(liste[0].dateRelance).toBe("2026-12-01")
  })

  it("refuse un changement vers une étape hors des 6 (contrainte de la base)", async () => {
    const depot = await createSqliteProspectRepository(urlTemporaire())
    const ajoute = await depot.ajouter(camille)
    await expect(
      depot.changerEtape(ajoute.id, "Inconnue" as Etape),
    ).rejects.toThrow()
    expect((await depot.lister())[0].etape).toBe("Nouveau")
  })

  it("refuse une étape hors des 6 prévues (contrainte de la base)", async () => {
    const depot = await createSqliteProspectRepository(urlTemporaire())
    await expect(
      depot.ajouter({ ...camille, etape: "Inconnue" as Etape }),
    ).rejects.toThrow()
  })
})
