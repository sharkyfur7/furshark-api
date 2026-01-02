import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          ts: "always",
          js: "always",
        },
      ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
    },
  },
];
