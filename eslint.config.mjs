import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["**/node_modules/**", "**/.expo/**", "**/coverage/**", "**/dist/**"]),
  {
    files: ["packages/backend/**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
  {
    files: ["packages/mobile/**/*.js"],
    plugins: { js, react: pluginReact, "react-hooks": pluginReactHooks },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.jest },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      ...pluginReact.configs.flat["jsx-runtime"].rules,
      ...pluginReactHooks.configs.recommended.rules,
      "react/prop-types": "off",
    },
  },
]);
