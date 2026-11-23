/** Date du jour du serveur au format YYYY-MM-DD, sans gestion de fuseau. */
export function dateDuJour(maintenant: Date = new Date()): string {
  const deuxChiffres = (n: number) => String(n).padStart(2, "0")
  return [
    maintenant.getFullYear(),
    deuxChiffres(maintenant.getMonth() + 1),
    deuxChiffres(maintenant.getDate()),
  ].join("-")
}

export type Horloge = { aujourdhui(): string }

export const horlogeSysteme: Horloge = { aujourdhui: () => dateDuJour() }
