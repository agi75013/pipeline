# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexte

Mini CRM de prospection mono-utilisateur (voir `INTENT.md`, source de vérité sur le produit : prospects, 6 étapes fixes, date de relance, critères d'acceptation). Le projet est au stade de socle : seuls Next.js, shadcn/ui et Vitest sont en place, il n'y a pas encore de code métier ni de base de données.

`AGENTS.md` avertit que cette version de Next.js (16.x) diffère de ce qu'on connaît : lire le guide pertinent dans `node_modules/next/dist/docs/` avant d'écrire du code Next.js. Ne pas retirer ce bloc de `AGENTS.md` (`next dev` le recrée).

## Commandes

Gestionnaire de paquets : pnpm.

- `pnpm dev` : serveur de dev
- `pnpm build` : build de production
- `pnpm lint` : ESLint
- `pnpm test` : Vitest, exécution unique
- `pnpm test:watch` : Vitest en mode watch
- Un seul fichier : `pnpm vitest run __tests__/ui-integration.test.tsx`
- Un seul test : `pnpm vitest run -t "nom du test"`
- Vérification de types : `npx tsc --noEmit` (pas de script dédié)

## Architecture

Architecture cible en 3 couches (`INTENT.md`), à respecter dès qu'on ajoute du code :

- Présentation : affiche et collecte les saisies, aucune règle métier.
- Service : règles métier (changement d'étape, calcul des prospects à relancer : date de relance aujourd'hui ou antérieure). Couvert par des tests unitaires.
- Données : seule couche qui parle à la base (SQLite en local, Turso comme cible de migration). Migrer vers une base managée ne doit modifier que cette couche.

Hors périmètre assumé : pas d'authentification, un seul utilisateur, déploiement Vercel.

## Conventions spécifiques

- Alias `@/*` vers `src/` ; code dans `src/app` (App Router).
- shadcn/ui : style `base-nova`, basé sur Base UI (`@base-ui/react`), pas Radix. Les composants sont dans `src/components/ui/` ; ajouter via `pnpm dlx shadcn@latest add <composant>`. Avec Base UI, les triggers utilisent la prop `render` (ex. `<DialogTrigger render={<Button />} />`) au lieu de `asChild`.
- `cn` vient du paquet npm `cn` (via `src/lib/utils.ts`), pas de `clsx` + `tailwind-merge`.
- Tailwind v4 (config dans `src/app/globals.css`, pas de `tailwind.config`).
- Tests : Vitest + jsdom + Testing Library, config dans `vitest.config.mts` (alias via `resolve.tsconfigPaths`), tests dans `__tests__/`. Le composant `Select` de Base UI est mal supporté par jsdom.
- Secrets dans `.env.local` (non versionné) ; `.env.example` ne contient aucun secret.
