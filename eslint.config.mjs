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

  // src/physics/ is pure math: no React, no Next, no browser. That keeps it
  // testable on its own and explainable without knowing the UI.
  {
    files: ["src/physics/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react/*", "react-dom", "react-dom/*", "next", "next/*", "@/*"],
              message: "src/physics/ must stay pure: no React, Next or app imports.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        { name: "window", message: "src/physics/ must not touch the browser." },
        { name: "document", message: "src/physics/ must not touch the browser." },
        { name: "localStorage", message: "src/physics/ must not touch the browser." },
      ],
    },
  },

  // Everything else reaches physics only through src/physics/index.ts.
  {
    files: ["src/**"],
    ignores: ["src/physics/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/physics/*", "**/physics/*"],
              message: 'Import physics from "@/physics" (src/physics/index.ts), not from a file inside it.',
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
