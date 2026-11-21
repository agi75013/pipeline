import { describe, expect, it } from "vitest"
import { createExampleService } from "@/service/example-service"

describe("couche service", () => {
  it("renvoie les données fournies par le dépôt", async () => {
    const fakeRepo = { list: async () => ["x"] }
    const service = createExampleService(fakeRepo)
    expect(await service.getItems()).toEqual(["x"])
  })
})
