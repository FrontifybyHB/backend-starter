import js from "@eslint/js";
import globals from "globals";
import eslintPluginImport from 'eslint-plugin-import';

export default [
  {
    ignores: ['node_modules/**', 'logs/**', 'coverage/**'],
  },
  {
    files: ['eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      }, 
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
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'import/order': [
        'warn',
        { groups: [['builtin', 'external', 'internal']] },
      ],
      'import/no-unresolved': 'error',
    },
  },
];
