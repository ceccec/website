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

/**
 * `pnpm build` runs `payload migrate` (via deploy:database or Vercel pipeline). Payload may prompt
 * about dev-mode drift — that blocks CI and local builds. Default to non-interactive yes unless
 * the operator set `PAYLOAD_MIGRATE_ASSUME_NO` or an explicit `PAYLOAD_MIGRATE_ASSUME_YES` value.
 *
 * @see scripts/migrate-production.mjs
 */
function buildChildEnv() {
  const e = { ...process.env }
  if (e.PAYLOAD_MIGRATE_ASSUME_NO === '1' || e.PAYLOAD_MIGRATE_ASSUME_NO === 'true') {
    return e
  }
  const explicit =
    e.PAYLOAD_MIGRATE_ASSUME_YES != null && String(e.PAYLOAD_MIGRATE_ASSUME_YES).trim() !== ''
  if (!explicit) {
    e.PAYLOAD_MIGRATE_ASSUME_YES = '1'
  }
  return e
}

const childEnv = buildChildEnv()

if (process.env.OPEN_NEXT_INNER_BUILD === '1') {
  // Use `pnpm exec` so devDependencies (cross-env) resolve like other scripts; plain `cross-env`
  // is not always on PATH when OpenNext spawns `pnpm run build`.
  execSync('pnpm exec cross-env NODE_OPTIONS=--no-deprecation next build --webpack', {
    stdio: 'inherit',
    env: childEnv,
  })
  process.exit(0)
}

const skipMigrate =
  process.env.SKIP_DATABASE_MIGRATE === '1' || process.env.SKIP_DATABASE_MIGRATE === 'true'

const vercelPipeline = skipMigrate
  ? 'pnpm run generate:llms && cross-env NODE_OPTIONS=--no-deprecation next build --webpack'
  : 'pnpm run generate:llms && payload migrate && cross-env NODE_OPTIONS=--no-deprecation next build --webpack'

if (getDeploymentTargetFromEnv() === 'vercel') {
  execSync(vercelPipeline, { stdio: 'inherit', env: childEnv })
} else {
  execSync('pnpm run workers:build', { stdio: 'inherit', env: childEnv })
}
