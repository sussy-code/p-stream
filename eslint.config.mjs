import path from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const a11yOff = Object.keys(jsxA11y.rules).reduce((acc, rule) => {
  acc[`jsx-a11y/${rule}`] = "off";
  return acc;
}, {});

export default tseslint.config(
  ...compat.extends("airbnb", "airbnb/hooks"),
  tseslint.configs.recommended,
  {
    ignores: [
      "public/*",
      "dist/*",
      "/*.js",
      "/*.ts",
      "/*.mts",
      "/plugins/*.ts",
      "/plugins/*.mjs",
      "/themes/**/*.ts",
    ],

    languageOptions: {
      globals: { ...globals.browser },
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: "./",
      },
    },

    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react,
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },

    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/require-default-props": "off",
      "react/destructuring-assignment": "off",
      "no-underscore-dangle": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": ["warn", { allow: ["warn", "error", "debug", "info"] }],
      "@typescript-eslint/no-this-alias": "off",
      "import/prefer-default-export": "off",
      "@typescript-eslint/no-empty-function": "off",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": ["error"],
      "no-restricted-syntax": "off",
      "import/no-unresolved": ["error", { ignore: ["^virtual:"] }],
      "react/jsx-props-no-spreading": "off",
      "consistent-return": "off",
      "no-continue": "off",
      "no-eval": "off",
      "no-await-in-loop": "off",
      "no-nested-ternary": "off",
      "prefer-destructuring": "off",
      "no-param-reassign": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react/jsx-filename-extension": [
        "error",
        { extensions: [".js", ".jsx", ".tsx"] },
      ],
      "import/extensions": [
        "error",
        "ignorePackages",
        { ts: "never", tsx: "never" },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["sibling", "parent"],
            "index",
            "unknown",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "sort-imports": [
        "error",
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
          allowSeparatedGroups: true,
        },
      ],
      ...a11yOff,
    },
  },
  eslintPluginPrettierRecommended,
);
