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
    // No `**` in globs — typescript-eslint disallowDefaultProjectWideGlob (performance).
    // Do not list root `*.js` / `*.d.ts` / etc. here: they are already in `tsconfig.json` and
    // duplicate entries cause "included by allowDefaultProject but also in project service".
    allowDefaultProject: [
      'scripts/build.mjs',
      'scripts/custom-server.example.mjs',
      'scripts/generate-payload-cursor-rules.mjs',
      'scripts/generate-next-cursor-rules.mjs',
      'scripts/migrate-production.mjs',
      'scripts/next-start-unix.mjs',
      'scripts/sync-cloudflare-bindings.mjs',
      'scripts/verify-payload-wiring.mjs',
      'scripts/vercel-config-dry.mjs',
      'scripts/lib/deploymentTarget.mjs',
      'scripts/lib/nextBuildPipeline.mjs',
      'scripts/lib/opennextCloudflareIgnoredPayloadPackages.mjs',
      'scripts/lib/payloadMigrateRunner.mjs',
      'scripts/lib/wranglerConfig.mjs',
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
