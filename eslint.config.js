import payloadEsLintConfig from '@payloadcms/eslint-config'
import payloadPlugin from '@payloadcms/eslint-plugin'
import nextPlugin from '@next/eslint-plugin-next'
import { defineConfig, globalIgnores } from 'eslint/config'

export const defaultESLintIgnores = [
  '**/.temp',
  '**/.*', // ignore all dotfiles
  '**/.git',
  '**/.hg',
  '**/.pnp.*',
  '**/.svn',
  '**/playwright.config.ts',
  '**/jest.config.js',
  '**/tsconfig.tsbuildinfo',
  '**/README.md',
  '**/eslint.config.js',
  '**/payload-types.ts',
  '**/dist/',
  '**/.yarn/',
  '**/build/',
  '**/node_modules/',
  '**/temp/',
]

/** @typedef {import('eslint').Linter.Config} Config */

/** @see https://nextjs.org/docs/app/api-reference/config/eslint — Next 16 + ESLint 9 flat config */
export const rootParserOptions = {
  sourceType: 'module',
  ecmaVersion: 'latest',
  projectService: {
    maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 40,
    allowDefaultProject: [
      'scripts/**/*.ts',
      'scripts/**/*.js',
      'scripts/**/*.mjs',
      '*.js',
      '*.mjs',
      '*.cjs',
      '*.spec.ts',
      '*.d.ts',
      'next-sitemap.config.cjs',
    ],
  },
}

/** @type {Config[]} */
export const rootEslintConfig = [
  ...payloadEsLintConfig,
  {
    ignores: [...defaultESLintIgnores, 'packages/**/*.spec.ts'],
  },
  {
    plugins: {
      payload: payloadPlugin,
    },
    rules: {
      'payload/no-jsx-import-statements': 'warn',
      restrictDefaultExports: 'off',
    },
  },
]

export default defineConfig([
  // Next.js 16: no `next lint` — use ESLint CLI + `@next/eslint-plugin-next` (flat `core-web-vitals`) alongside Payload.
  nextPlugin.configs['core-web-vitals'],
  ...rootEslintConfig,
  {
    languageOptions: {
      parserOptions: {
        ...rootParserOptions,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    name: 'Next.js pages',
    rules: {
      'no-restricted-exports': 'off',
    },
    files: [
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/app/**/page.client.tsx',
      'src/app/**/not-found.tsx',
      'src/payload.config.ts',
    ],
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    '.open-next/**',
    '.wrangler/**',
    'next-env.d.ts',
  ]),
])
