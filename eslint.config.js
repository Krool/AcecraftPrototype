import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: [
      'dist/**',
      'dist-itch/**',
      'node_modules/**',
      // Build tool script and service worker: not app code, different global
      // environment (Node / SW), not worth a second languageOptions block for
      // a two-file surface.
      'generate-icons.js',
      'public/sw.js',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Prototype-stage codebase; these fire widely (100+ call sites) and are
      // not correctness bugs. Off rather than mass-editing unrelated files.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      // typescript-eslint 8 split the old ban-types rule (off here) in three.
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      // New in ESLint 10's recommended set; flags a dozen harmless
      // initialisers in the scene files.
      'no-useless-assignment': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-inner-declarations': 'off',
      'no-case-declarations': 'off',
    },
  },
];
