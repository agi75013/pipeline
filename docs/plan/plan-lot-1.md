# Plan Lot 1 : Ajouter un prospect et le retrouver dans la liste

## Contexte
Premier lot métier de Pipeline (`LOTS.md`). Aujourd'hui seuls des fichiers `example-*` existent dans les 3 couches, et `src/app/page.tsx` affiche un formulaire factice. Règles : `.claude/rules/` (service testé avant le code, présentation sans couleur en dur ni accès données, seule la couche données parle à la base).

## Décision à valider
Pilote SQLite : `@libsql/client` (recommandé). Il lit un fichier local (`file:pipeline.db`) et Turso (`libsql://...`) avec la même API, donc le lot 6 ne change que l'URL dans l'environnement. Alternative : `better-sqlite3` (module natif, réécriture au lot 6). Compatibilité exacte avec Next 16.4 / Vercel non vérifiée, à confirmer à l'installation.

## Modélisation des données

### Entité Prospect (type TypeScript, camelCase)
| Champ | Type TS | Obligatoire | Remarque |
|---|---|---|---|
| id | string | oui | UUID généré par la couche données (`crypto.randomUUID()`) |
| nom | string | oui | non vide après trim |
| societe | string \| null | non | |
| email | string \| null | non | au moins un de email / telephone |
| telephone | string \| null | non | au moins un de email / telephone |
| etape | Etape | oui | une des 6 valeurs, « Nouveau » à la création |
| dateRelance | string \| null | non | `YYYY-MM-DD`, utilisée au lot 3 |
| notes | string \| null | non | |
| creeLe | string | oui | ISO 8601 UTC, sert au tri (récent en haut) |

`Etape` = union des 6 valeurs fixes (`Nouveau`, `Contacté`, `Réponse reçue`, `RDV`, `Gagné`, `Perdu`), définie une seule fois côté données et réutilisée par service et présentation.

### Table SQLite `prospects` (snake_case)
```sql
CREATE TABLE IF NOT EXISTS prospects (
  id           TEXT PRIMARY KEY,
  nom          TEXT NOT NULL,
  societe      TEXT,
  email        TEXT,
  telephone    TEXT,
  etape        TEXT NOT NULL DEFAULT 'Nouveau'
               CHECK (etape IN ('Nouveau','Contacté','Réponse reçue','RDV','Gagné','Perdu')),
  date_relance TEXT,            -- 'YYYY-MM-DD', sans fuseau (décision LOTS.md)
  notes        TEXT,
  cree_le      TEXT NOT NULL    -- ISO 8601 UTC
);
```
- Chaînes vides stockées en `NULL` (le mapping est fait dans le dépôt).
- Dates en texte ISO : la comparaison « aujourd'hui ou antérieure » du lot 3 fonctionne par simple comparaison de chaînes, et c'est portable vers Turso.
- Index sur `date_relance` : à créer au lot 3, pas avant.
- `CHECK` sur `etape` : garde-fou d'intégrité (le service reste la règle de référence). Le contrôle « email ou téléphone » reste uniquement dans le service pour ne pas dupliquer la règle métier (à valider).
- Schéma créé à l'initialisation du dépôt, version suivie par `PRAGMA user_version` pour préparer les évolutions des lots suivants. Les colonnes `date_relance` et `notes` existent dès le lot 1 pour éviter une migration au lot 3 et 4.
- Mapping type TS <-> colonnes (camelCase <-> snake_case) uniquement dans la couche données.

## Tâches par couche (ordre : données, service, présentation)

### Données (`src/data/`)
1. Types `Prospect`, `Etape`, `NouveauProspect` et interface `ProspectRepository` : `ajouter(nouveau)`, `lister()`.
2. `createInMemoryProspectRepository()` : double pour les tests du service.
3. `createSqliteProspectRepository(url)` : crée la table si absente, insère, liste (récent en haut). Seul fichier important le pilote.
4. Config : `DATABASE_URL` dans `.env.local`, `.env.example` sans secret, `*.db` dans `.gitignore`.
5. Supprimer les `example-*` (3 fichiers + 3 tests) une fois remplacés.

### Service (`src/service/`), test écrit et vu en échec avant chaque code
1. `prospect-service.ts` : `creerProspect(saisie)` avec dépôt injecté.
   - Nom vide ou espaces : refus, « Le nom est obligatoire ».
   - Ni email ni téléphone : refus, « Renseignez un email ou un téléphone ».
   - Succès : étape forcée à « Nouveau », champs nettoyés (trim).
   - Résultat typé `{ ok: true, prospect } | { ok: false, erreurs }`.
2. `listerProspects()` délègue au dépôt.

### Présentation (`src/presentation/`, `src/app/`)
Lire d'abord `node_modules/next/dist/docs/` (Server Actions, formulaires, cf. `AGENTS.md`).
1. Server Action dans `src/app/` : lit le `FormData`, appelle le service, renvoie les erreurs. Seul point de câblage (dépôt + service).
2. `ProspectForm` : nom, société, email, téléphone, bouton Ajouter, erreurs près des champs. Composants `ui/` et tokens uniquement.
3. `ProspectList` : nom, société, contact, badge d'étape, état vide explicite.
4. `page.tsx` : charge la liste via le service, assemble formulaire et liste, retire le bandeau « Aperçu ».

## Critères d'acceptation et preuve

| Critère | Test qui le prouve |
|---|---|
| Liste vide, j'ajoute « Camille Durand » avec email, elle apparaît à « Nouveau » | Service : `creerProspect` puis `listerProspects` renvoie 1 prospect `etape = "Nouveau"`. Présentation : `ProspectList` rend le nom et le badge. Données : insert puis `lister` sur SQLite temporaire. |
| Sans email ni téléphone, refus avec message qui dit quoi corriger | Service : refus + message, dépôt vide. Présentation : le formulaire affiche le message. Cas limite : espaces seuls. |
| Sans nom, refus | Service : refus + message, dépôt vide. Présentation : message affiché. |
| Après redémarrage local, toujours là | Données : fichier SQLite temporaire, dépôt A ajoute, est fermé, dépôt B sur le même fichier liste le prospect. Simule le redémarrage, ne remplace pas la vérification manuelle. |

Tests en plus : téléphone seul suffit, société facultative, étape toujours « Nouveau » même si la saisie en fournit une autre, chaîne vide stockée en `NULL`, la `CHECK` sur `etape` rejette une valeur hors liste (test données).

## Vérification de fin de lot
- `pnpm vitest run __tests__/service`, `__tests__/data`, puis `pnpm test`, `pnpm lint`, `npx tsc --noEmit`.
- Commandes `grep` des 3 règles (`donnees.md`, `presentation.md`, `service.md`).
- Manuel : `pnpm dev`, ajouter Camille Durand, arrêter puis relancer, la revoir. Contrôle visuel clair et sombre.

## Hors lot 1
Changement d'étape (lot 2), date de relance (lot 3), modifier et supprimer (lots 4 et 5), Turso et déploiement (lot 6).
