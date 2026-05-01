#!/usr/bin/env node
/**
 * Default `pnpm build` routes by env (`scripts/lib/deploymentTarget.mjs`):
 * - **Vercel / Docker (Mongo path):** shared pipeline in `scripts/lib/nextBuildPipeline.mjs`
 * - **Cloudflare:** `workers:build` → migrate + OpenNext
 *
 * `OPEN_NEXT_INNER_BUILD=1` breaks OpenNext recursion into Next-only (`next build --webpack`).
 */
import { execSync } from 'node:child_process'

import { getDeploymentTargetFromEnv } from './lib/deploymentTarget.mjs'
import { execVercelStyleBuildPipeline } from './lib/nextBuildPipeline.mjs'

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
  execSync('pnpm exec cross-env NODE_OPTIONS=--no-deprecation next build --webpack', {
    stdio: 'inherit',
    env: childEnv,
  })
  process.exit(0)
}

const skipMigrate =
  process.env.SKIP_DATABASE_MIGRATE === '1' || process.env.SKIP_DATABASE_MIGRATE === 'true'

if (getDeploymentTargetFromEnv() === 'vercel') {
  execVercelStyleBuildPipeline(childEnv, skipMigrate)
} else {
  execSync('pnpm run workers:build', { stdio: 'inherit', env: childEnv })
}
