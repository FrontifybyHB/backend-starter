import js from "@eslint/js";
import globals from "globals";
import eslintPluginImport from 'eslint-plugin-import';

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser
    },
    plugins: {
      js,
      import: eslintPluginImport,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.mjs', '.cjs', '.json'],
        },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'import/order': [
        'warn',
        { groups: [['builtin', 'external', 'internal']] },
      ],
      'import/no-unresolved': 'error',
    },
  },
];