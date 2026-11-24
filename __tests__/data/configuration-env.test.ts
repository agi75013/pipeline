// @vitest-environment node
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const racine = join(__dirname, "..", "..")

const variables = (contenu: string) =>
  Object.fromEntries(
    contenu
      .split("\n")
      .map((ligne) => ligne.trim())
      .filter((ligne) => ligne && !ligne.startsWith("#"))
      .map((ligne) => {
        const i = ligne.indexOf("=")
        return [ligne.slice(0, i), ligne.slice(i + 1)]
      }),
  )

describe("configuration d'environnement sans identifiant Turso", () => {
  const exemple = variables(
    readFileSync(join(racine, ".env.example"), "utf8"),
  )

  it(".env.example déclare DATABASE_AUTH_TOKEN sans valeur", () => {
    expect(exemple).toHaveProperty("DATABASE_AUTH_TOKEN", "")
  })

  it(".env.example garde la base locale comme URL par défaut", () => {
    expect(exemple.DATABASE_URL).toBe("file:pipeline.db")
  })

  it("aucun fichier .env autre que .env.example n'est versionné", () => {
    const suivis = execFileSync("git", ["ls-files"], {
      cwd: racine,
      encoding: "utf8",
    })
      .split("\n")
      .filter((f) => /(^|\/)\.env/.test(f))
    expect(suivis).toEqual([".env.example"])
  })
})
