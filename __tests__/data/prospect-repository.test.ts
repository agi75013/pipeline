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

  it("refuse une étape hors des 6 prévues (contrainte de la base)", async () => {
    const depot = await createSqliteProspectRepository(urlTemporaire())
    await expect(
      depot.ajouter({ ...camille, etape: "Inconnue" as Etape }),
    ).rejects.toThrow()
  })
})
