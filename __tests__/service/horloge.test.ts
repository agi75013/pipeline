import { describe, expect, it } from "vitest"
import { dateDuJour } from "@/service/horloge"

describe("horloge", () => {
  it("formate la date locale en YYYY-MM-DD", () => {
    expect(dateDuJour(new Date(2026, 10, 3, 23, 59))).toBe("2026-11-03")
  })

  it("renvoie la date du jour par défaut", () => {
    expect(dateDuJour()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
