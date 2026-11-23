// Mise en mots des dates de relance (affichage seulement, aucune règle métier).

/** "2026-11-23" vers "23/11/2026". */
export const formaterDate = (date: string) => date.split("-").reverse().join("/")

/** Date YYYY-MM-DD décalée de n jours. */
export function decalerDate(date: string, jours: number): string {
  const d = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10) + jours))
  return d.toISOString().slice(0, 10)
}

/** Libellés d'une relance selon son écart en jours avec aujourd'hui. */
export function libelleRelance(date: string, ecart: number): { court: string; long: string } {
  if (ecart === 0) return { court: "Auj.", long: "Aujourd'hui" }
  if (ecart === -1) return { court: "Hier", long: "Hier" }
  if (ecart < 0) return { court: `Retard ${-ecart} j`, long: `En retard de ${-ecart} j` }
  if (ecart === 1) return { court: "Demain", long: "Demain" }
  return { court: formaterDate(date), long: `Le ${formaterDate(date)}` }
}
