export interface ExampleRepository {
  list(): Promise<string[]>
}

export function createInMemoryExampleRepository(
  items: string[] = [],
): ExampleRepository {
  return {
    async list() {
      return [...items]
    },
  }
}
