import js from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["**/node_modules/**", "**/.expo/**", "**/coverage/**"]),
  {
    files: ["packages/backend/**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
]);
