import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import tailwindcssPlugin from "eslint-plugin-tailwindcss";
import testingLibraryPlugin from "eslint-plugin-testing-library";
import storybookPlugin from "eslint-plugin-storybook";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  jsxA11y.flatConfigs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],

  prettierConfig,
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
      "testing-library": testingLibraryPlugin,
      storybook: storybookPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: "19.1",
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "testing-library/await-async-queries": "error",
      "testing-library/no-await-sync-queries": "error",
      "testing-library/no-debugging-utils": "warn",
      "testing-library/no-dom-import": "error",
      "storybook/await-interactions": "error",
      "storybook/use-storybook-expect": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["apps/**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/.out/**",
      "**/storybook-static/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/*.config.*",
      "**/*.d.ts",
      "**/.storybook/**",
      "**/e2e/**",
    ],
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "storybook/use-storybook-expect": "off",
      "storybook/await-interactions": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-empty-function": [
        "error",
        { allow: ["methods", "arrowFunctions"] },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
);
