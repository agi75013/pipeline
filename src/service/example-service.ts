import type { ExampleRepository } from "@/data/example-repository"

export function createExampleService(repository: ExampleRepository) {
  return {
    async getItems(): Promise<string[]> {
      return repository.list()
    },
  }
}
