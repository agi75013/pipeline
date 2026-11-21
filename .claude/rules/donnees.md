---
paths:
  - "src/data/**"
  - "__tests__/data/**"
---

# Couche données

- Seule couche qui parle à la base (SQLite en local, Turso en cible). Aucun import de driver ou de client de base en dehors de `src/data`.
- Elle expose une interface de dépôt. Passer à une base managée ne modifie que cette couche.
- Elle n'importe ni le service, ni la présentation.
- Identifiants et URL de connexion dans `.env.local` (jamais versionné). `.env.example` sans secret.

## Comment vérifier

1. Aucun accès base hors de la couche :
   `grep -rnE "from ['\"](better-sqlite3|sqlite3|@libsql/client|libsql|drizzle-orm|kysely)" src --include=*.ts --include=*.tsx | grep -v "^src/data/"` ne renvoie rien. La liste des pilotes est à compléter selon celui qui sera choisi (aucun n'est installé aujourd'hui).
2. Pas de dépendance montante : `grep -rnE "from ['\"]@/(service|presentation)" src/data` ne renvoie rien. Le lint l'impose aussi.
3. Secrets : `git ls-files | grep -E "^\.env($|\.local)"` ne renvoie rien (`.env.example` est le seul fichier `.env*` autorisé, et il n'est pas capté par cette commande).
4. `pnpm lint` et `pnpm vitest run __tests__/data` verts.
