import type { ProspectRepository, Prospect } from "@/data/prospect"

export function createInMemoryProspectRepository(): ProspectRepository {
  const prospects: Prospect[] = []
  const mettreAJour = (id: string, champs: Partial<Prospect>) => {
    const index = prospects.findIndex((p) => p.id === id)
    if (index === -1) return null
    prospects[index] = { ...prospects[index], ...champs }
    return prospects[index]
  }

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
      return mettreAJour(id, { etape })
    },
    async definirDateRelance(id, dateRelance) {
      return mettreAJour(id, { dateRelance })
    },
  }
}
