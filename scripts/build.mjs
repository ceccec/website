#!/usr/bin/env node
/**
 * Default `pnpm build` must work for both Vercel (Postgres + `next build`) and Cloudflare
 * (D1 + OpenNext). CI has no Workers `navigator` — routing matches `getDeploymentTarget()`
 * via `scripts/lib/deploymentTarget.mjs`.
 *
 * **`next build --webpack`** — Next 16 defaults to Turbopack; this repo’s CSS modules use patterns
 * Turbopack still rejects (`:local()`, ambiguous `:global`). Webpack matches prior behavior.
 *
 * **Cloudflare path:** `workers:build` runs `deploy:database` first (`payload migrate`) so D1 schema
 * matches migrations before OpenNext — see `payload-migrations.mdc`. `SKIP_DATABASE_MIGRATE` is only
 * for exceptional pipelines.
 *
 * OpenNext runs `pnpm run build` internally to compile Next.js. Without this guard that
 * invocation would recurse into `workers:build` forever (`build` → workers → opennext → build → …).
 */
import { execSync } from 'node:child_process'

import { getDeploymentTargetFromEnv } from './lib/deploymentTarget.mjs'

if (process.env.OPEN_NEXT_INNER_BUILD === '1') {
  // Use `pnpm exec` so devDependencies (cross-env) resolve like other scripts; plain `cross-env`
  // is not always on PATH when OpenNext spawns `pnpm run build`.
  execSync('pnpm exec cross-env NODE_OPTIONS=--no-deprecation next build --webpack', {
    stdio: 'inherit',
    env: process.env,
  })
  process.exit(0)
}

const skipMigrate =
  process.env.SKIP_DATABASE_MIGRATE === '1' || process.env.SKIP_DATABASE_MIGRATE === 'true'

const vercelPipeline = skipMigrate
  ? 'pnpm run generate:llms && cross-env NODE_OPTIONS=--no-deprecation next build --webpack'
  : 'pnpm run generate:llms && payload migrate && cross-env NODE_OPTIONS=--no-deprecation next build --webpack'

if (getDeploymentTargetFromEnv() === 'vercel') {
  execSync(vercelPipeline, { stdio: 'inherit', env: process.env })
} else {
  execSync('pnpm run workers:build', { stdio: 'inherit', env: process.env })
}
