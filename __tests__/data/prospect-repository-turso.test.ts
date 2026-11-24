// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Client libsql simulé : on vérifie les paramètres de connexion sans joindre Turso.
const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(() => ({
    execute: vi.fn(async () => ({ rows: [], rowsAffected: 0 })),
    close: vi.fn(),
  })),
}))
vi.mock("@libsql/client", () => ({ createClient }))

import { createSqliteProspectRepository } from "@/data/prospect-repository-sqlite"

const URL_TURSO = "libsql://exemple.turso.io"

describe("connexion du dépôt à Turso", () => {
  const jetonInitial = process.env.DATABASE_AUTH_TOKEN

  beforeEach(() => {
    createClient.mockClear()
    delete process.env.DATABASE_AUTH_TOKEN
  })

  afterEach(() => {
    if (jetonInitial === undefined) delete process.env.DATABASE_AUTH_TOKEN
    else process.env.DATABASE_AUTH_TOKEN = jetonInitial
  })

  it("transmet l'URL et le jeton fournis au client libsql", async () => {
    await createSqliteProspectRepository(URL_TURSO, "jeton-de-test")
    expect(createClient).toHaveBeenCalledWith({
      url: URL_TURSO,
      authToken: "jeton-de-test",
    })
  })

  it("lit le jeton dans DATABASE_AUTH_TOKEN par défaut", async () => {
    process.env.DATABASE_AUTH_TOKEN = "jeton-env"
    await createSqliteProspectRepository(URL_TURSO)
    expect(createClient).toHaveBeenCalledWith({
      url: URL_TURSO,
      authToken: "jeton-env",
    })
  })

  it("n'envoie aucun jeton pour une base locale sans DATABASE_AUTH_TOKEN", async () => {
    await createSqliteProspectRepository("file:pipeline.db")
    expect(createClient).toHaveBeenCalledWith({
      url: "file:pipeline.db",
      authToken: undefined,
    })
  })

  it("traite un DATABASE_AUTH_TOKEN vide comme absent", async () => {
    process.env.DATABASE_AUTH_TOKEN = ""
    await createSqliteProspectRepository("file:pipeline.db")
    expect(createClient).toHaveBeenCalledWith({
      url: "file:pipeline.db",
      authToken: undefined,
    })
  })
})
