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
  ]),
  {
    // shadcn/ui-generated files are re-fetched via `npx shadcn add`, never
    // hand-edited (see coding-standards.md), so the upstream carousel.tsx's
    // react-hooks/set-state-in-effect violation can't be fixed locally.
    files: ["components/ui/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
