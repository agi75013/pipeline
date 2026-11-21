---
paths:
  - "src/presentation/**"
  - "src/app/**"
  - "src/components/**"
---

# Couche présentation

- Elle affiche et collecte les saisies. Aucune règle métier.
- Elle n'appelle que la couche service. Jamais `src/data`, jamais la base.
- Elle n'utilise que les composants du design system (`src/components/ui/`) et les tokens du thème (`bg-background`, `text-muted-foreground`, `bg-primary`...).
- Aucune couleur en dur : pas de hex, `rgb()`, `oklch()` ni classes de palette Tailwind (`bg-zinc-50`, `text-red-600`, `bg-[#fff]`). Les valeurs de couleur vivent uniquement dans `src/app/globals.css`.

## Comment vérifier

1. Imports : `grep -rnE "from ['\"]@/data|from ['\"]\.\./data" src/presentation src/app src/components` ne renvoie rien. Le lint l'impose aussi (`no-restricted-imports` dans `eslint.config.mjs`).
2. Couleurs en dur :
   `grep -rnEi "#[0-9a-f]{3,8}\b|rgb\(|hsl\(|oklch\(|-(zinc|gray|slate|neutral|stone|red|orange|amber|yellow|green|blue|indigo|violet|purple|pink)-[0-9]{2,3}" src/presentation src/app/page.tsx src/app/layout.tsx src/components --exclude-dir=ui` ne renvoie rien.
3. `pnpm lint` et `pnpm test` verts.
