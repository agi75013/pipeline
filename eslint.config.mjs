import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Skills et agents installés (code tiers, hors périmètre du lint).
    ".claude/**",
  ]),
  // Architecture en 3 couches : présentation -> service -> données.
  {
    files: ["src/presentation/**", "src/app/**", "src/components/**"],
    ignores: ["src/components/ui/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/data/*", "**/data/*"],
              message: "La présentation passe par la couche service.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/service/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/presentation/*", "**/presentation/*"],
              message: "Le service ne dépend pas de la présentation.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/data/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/presentation/*",
                "**/presentation/*",
                "@/service/*",
                "**/service/*",
              ],
              message: "La couche données ne dépend d'aucune autre couche.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
