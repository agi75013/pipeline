---
paths:
  - "src/app/**/actions.ts"
  - "src/app/**/actions/**"
  - "src/presentation/**"
  - "__tests__/presentation/actions.test.ts"
---

# Validation des server actions

Règle de la couche présentation. Les arguments d'une server action viennent du navigateur : ils ne sont jamais fiables, même quand le formulaire de l'application les contrôle déjà.

- Chaque donnée en entrée d'une server action (champ de `FormData`, argument direct) est validée par zod avant tout appel au service.
- Le schéma zod est défini dans le fichier de l'action et utilisé avec `safeParse`. Le service ne reçoit que les données ressorties du schéma (`resultat.data`), jamais les valeurs brutes.
- Le schéma contrôle la forme : type, présence, nettoyage (`trim`), valeur dans une liste (`z.enum`). Les règles métier (nom obligatoire, email ou téléphone obligatoire, étape libre entre les 6) restent dans le service.
- Si la validation échoue, l'action renvoie un message d'erreur clair et n'appelle ni le service ni la base.
- Une nouvelle server action n'est pas terminée sans ses tests : valeur du mauvais type, champ absent, valeur hors liste, et vérification que le service n'est pas appelé.

## Comment vérifier

1. Toute action utilise zod : `grep -rlE "^['\"]use server['\"]" src | xargs -r grep -L "from ['\"]zod['\"]"` ne renvoie rien.
2. Toute validation passe par un schéma : `grep -rlE "^['\"]use server['\"]" src | xargs -r grep -L "safeParse"` ne renvoie rien.
3. Lecture manuelle : aucun `formData.get(...)` ni argument d'action n'est passé directement au service, seulement `.data` du schéma.
4. `pnpm lint` et `pnpm vitest run __tests__/presentation/actions.test.ts` verts, avec un test de rejet par action.
