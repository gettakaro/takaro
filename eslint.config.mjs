// @ts-check

import url from 'node:url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import storybookPlugin from 'eslint-plugin-storybook';
import prettierConfig from 'eslint-config-prettier';

import { FlatCompat } from '@eslint/eslintrc';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default tseslint.config(
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react': reactPlugin,
    },
  },

  // ignore in all configs
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/fixtures/**',
      '**/__snapshots__/**',
      '**/coverage/**',
      '**/_data/**',
      '**/generated/**',
      '**/storybook-static/**',
      '**/.next/**',
      '**/migrations/**',
      '**/*.d.ts',
      '**/jest.config.js',
      '**/.storybook/**',
      '**/.docusaurus/**',
      '**/reports/**'
    ],
  },

  // extends
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,

  //
  // base config
  //
  {
    languageOptions: {
      parserOptions: {
        allowAutommaticSingleRunInference: true,
        cacheLiftetime: {
          // We never create/change tsconfig structure - so no need to ever evict the cache
          // In the rare case that we do - just manually restart IDE
          glob: 'infinity',
        },
        project: ['tsconfig.json', 'tsconfig.react.json', 'packages/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },
    rules: {

      'no-console': 'off',
      semi: ['error', 'always'],
      'logical-assignment-operators': 'error',
      'no-else-return': 'off',
      'no-process-exit': 'off',
      'no-fallthrough': ['error', { commentPattern: '.*intentional fallthrough.*' }],
      'no-implicit-coercion': ['error', { boolean: false }],
      'no-lonely-if': 'error',
      'no-unreachable-loop': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'off',
      'no-useless-escape': 'off',
      'no-useless-concat': 'error',
      'no-var': 'error',
      'no-void': ['error', { allowAsStatement: true }],
      'one-var': ['error', 'never'],
      'operator-assignment': 'error',
      'prefer-const': 'error',
      'prefer-object-spread': 'error',
      'prefer-rest-params': 'error',

      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          caughtErrors: 'all',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-empty-function': [
        'error',
        {
          allow: ['arrowFunctions'],
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      // turn off other type-aware rules
      'deprecation/deprecation': 'off',
      'no-undef': 'off',
      '@typescript-eslint/internal/no-poorly-typed-ts-props': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },


  // config for storybook
  {
    files: ['**/*.stories.tsx'],
    extends: [
      ...compat.config(storybookPlugin.configs.recommended)
    ],
  },

  // config for tests
  {
    files: ['**/*.test.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    }
  },

  // config for react packages
  {
    files: ['packages/lib-components/**/*.{ts,tsx,mts,cts,js,jsx}', 'packages/web-main/**/*.{ts,tsx,mts,cts,js,jsx}'],
    extends: [
      ...compat.config(reactPlugin.configs.recommended),
    ],
    rules: {
      'import/no-default-export': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'react/exhaustive-deps': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
);
