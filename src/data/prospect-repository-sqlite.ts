import { createClient } from "@libsql/client"
import { ETAPES } from "@/data/prospect"
import type { Etape, Prospect, ProspectRepository } from "@/data/prospect"

const SCHEMA = `
CREATE TABLE IF NOT EXISTS prospects (
  id           TEXT PRIMARY KEY,
  nom          TEXT NOT NULL,
  societe      TEXT,
  email        TEXT,
  telephone    TEXT,
  etape        TEXT NOT NULL DEFAULT 'Nouveau'
               CHECK (etape IN (${ETAPES.map((e) => `'${e}'`).join(",")})),
  date_relance TEXT,
  notes        TEXT,
  cree_le      TEXT NOT NULL
)`

const texteOuNull = (valeur: unknown) =>
  valeur === null || valeur === undefined ? null : String(valeur)

export type SqliteProspectRepository = ProspectRepository & {
  fermer(): Promise<void>
}

export async function createSqliteProspectRepository(
  url: string,
): Promise<SqliteProspectRepository> {
  const client = createClient({ url })
  await client.execute(SCHEMA)

  return {
    async ajouter(nouveau) {
      const prospect: Prospect = {
        ...nouveau,
        id: crypto.randomUUID(),
        dateRelance: null,
        notes: null,
        creeLe: new Date().toISOString(),
      }
      await client.execute({
        sql: `INSERT INTO prospects
          (id, nom, societe, email, telephone, etape, date_relance, notes, cree_le)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          prospect.id,
          prospect.nom,
          prospect.societe,
          prospect.email,
          prospect.telephone,
          prospect.etape,
          prospect.dateRelance,
          prospect.notes,
          prospect.creeLe,
        ],
      })
      return prospect
    },

    async lister() {
      const resultat = await client.execute(
        "SELECT * FROM prospects ORDER BY cree_le DESC, rowid DESC",
      )
      return resultat.rows.map((ligne) => ({
        id: String(ligne.id),
        nom: String(ligne.nom),
        societe: texteOuNull(ligne.societe),
        email: texteOuNull(ligne.email),
        telephone: texteOuNull(ligne.telephone),
        etape: String(ligne.etape) as Etape,
        dateRelance: texteOuNull(ligne.date_relance),
        notes: texteOuNull(ligne.notes),
        creeLe: String(ligne.cree_le),
      }))
    },

    async fermer() {
      client.close()
    },
  }
}
