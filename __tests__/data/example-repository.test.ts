import { describe, expect, it } from "vitest"
import { createInMemoryExampleRepository } from "@/data/example-repository"

describe("couche données", () => {
  it("renvoie la liste du dépôt en mémoire", async () => {
    const repo = createInMemoryExampleRepository(["a", "b"])
    expect(await repo.list()).toEqual(["a", "b"])
  })
})
