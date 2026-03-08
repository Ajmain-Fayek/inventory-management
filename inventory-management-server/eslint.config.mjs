//@ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default defineConfig(
  {
    ignores: ["node_modules/**", "dist/**", "build/**", "generated/**"],
  },
  eslint.configs.recommended,
  tseslint.configs.stylistic,
  prettierConfig,
  {
    rules: {
      // "no-console": "warn",
      // indent: ["error", 2],
    },
  },
);
