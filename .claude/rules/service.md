---
paths:
  - "src/service/**"
  - "__tests__/service/**"
---

# Couche service

- Elle porte les règles métier : changement d'étape (libre entre les 6 étapes fixes) et calcul des prospects à relancer (date de relance aujourd'hui ou antérieure).
- Elle reçoit son dépôt de données par injection (interface définie côté données). Elle n'importe ni la présentation, ni React, ni Next.js, ni un driver de base.
- La date du jour est passée en paramètre (ou via une horloge injectée), jamais lue en dur dans la règle, pour que les tests soient déterministes.
- Les tests sont écrits avant le code : écrire le test, le voir échouer, puis écrire le code minimal pour le faire passer.

## Comment vérifier

1. Chaque fichier `src/service/x.ts` a son `__tests__/service/x.test.ts` :
   `for f in src/service/*.ts; do b=$(basename "$f" .ts); [ -f "__tests__/service/$b.test.ts" ] || echo "test manquant : $b"; done`
2. Imports interdits : `grep -rnE "from ['\"](react|next|@/presentation|@/components)" src/service` ne renvoie rien. Le lint l'impose aussi pour la présentation.
3. `pnpm vitest run __tests__/service` vert. L'ordre « test d'abord » ne se prouve pas par une commande : montrer l'exécution rouge (échec) avant d'écrire le code.
