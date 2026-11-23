/** "2026-11-23" vers "23/11/2026". Affichage seulement. */
export const formaterDate = (date: string) => date.split("-").reverse().join("/")
