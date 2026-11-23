import type { ProspectRepository, Prospect } from "@/data/prospect"

export function createInMemoryProspectRepository(): ProspectRepository {
  const prospects: Prospect[] = []
  return {
    async ajouter(nouveau) {
      const prospect: Prospect = {
        ...nouveau,
        id: crypto.randomUUID(),
        dateRelance: null,
        notes: null,
        creeLe: new Date().toISOString(),
      }
      prospects.push(prospect)
      return prospect
    },
    async lister() {
      return [...prospects].reverse()
    },
    async changerEtape(id, etape) {
      const index = prospects.findIndex((p) => p.id === id)
      if (index === -1) return null
      prospects[index] = { ...prospects[index], etape }
      return prospects[index]
    },
  }
}
