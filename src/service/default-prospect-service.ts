import { createSqliteProspectRepository } from "@/data/prospect-repository-sqlite"
import type { ProspectRepository } from "@/data/prospect"
import {
  createProspectService,
  type ProspectService,
} from "@/service/prospect-service"

const URL_PAR_DEFAUT = "file:pipeline.db"

let service: ProspectService | undefined

/** Point de câblage unique : service branché sur la base de DATABASE_URL. */
export function obtenirServiceProspects(): ProspectService {
  if (!service) {
    const url = process.env.DATABASE_URL || URL_PAR_DEFAUT
    // Dépôt ouvert à la première utilisation, la base est créée si absente.
    let depot: Promise<ProspectRepository> | undefined
    const obtenirDepot = () => (depot ??= createSqliteProspectRepository(url))
    service = createProspectService({
      ajouter: async (n) => (await obtenirDepot()).ajouter(n),
      lister: async () => (await obtenirDepot()).lister(),
      changerEtape: async (id, etape) =>
        (await obtenirDepot()).changerEtape(id, etape),
      definirDateRelance: async (id, date) =>
        (await obtenirDepot()).definirDateRelance(id, date),
    })
  }
  return service
}
