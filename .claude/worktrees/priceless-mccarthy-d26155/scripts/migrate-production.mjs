#!/usr/bin/env node
/**
 * Runs `payload migrate` so the database matches `src/migrations` (Payload docs: database migrations).
 *
 * Cloudflare-only follow-ups (see `.cursor/rules/payload-migrations.mdc`):
 * - `wrangler d1 migrations apply NEXT_TAG_CACHE_D1` (OpenNext tag cache DB)
 * - `wrangler d1 execute D1 … PRAGMA optimize` (Payload D1)
 *
 * Escape hatches (see `payload-migrations.mdc`):
 * - `SKIP_DATABASE_MIGRATE` — skip Payload migrate.
 * - `SKIP_NEXT_TAG_CACHE_MIGRATIONS` — skip OpenNext tag-cache D1 SQL migrations.
 * - `SKIP_D1_REMOTE_OPTIMIZE` / `SKIP_D1_PRAGMA` / `SKIP_D1_OPTIMIZE` — Wrangler remote/local heuristics.
 * - `PAYLOAD_MIGRATE_ASSUME_YES` / `PAYLOAD_MIGRATE_ASSUME_NO` — interactive migrate; CI implies assume-yes unless NO.
 *
 * Node-only: stack detection uses `scripts/lib/deploymentTarget.mjs` (no Workers `navigator`).
 */
import { execSync } from 'node:child_process'

import { getDeploymentTargetFromEnv } from './lib/deploymentTarget.mjs'
import { runPayloadMigratePipeline } from './lib/payloadMigrateRunner.mjs'
import { wranglerD1DatabaseIds } from './lib/wranglerConfig.mjs'

/** D1 + R2 only — no OpenNext DO queue (see `wrangler.payload-cli.jsonc`). */
const WRANGLER_D1_CLI = 'wrangler.payload-cli.jsonc'

function isLikelyValidD1Uuid(id) {
  if (!id || id.includes('REPLACE')) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

function wranglerEnv() {
  return {
    ...process.env,
    NODE_ENV: 'production',
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'ignore',
  }
}

function runWranglerD1MigrationsApply(binding, remoteArgs) {
  execSync(
    `pnpm exec wrangler --config ${WRANGLER_D1_CLI} d1 migrations apply ${binding} ${remoteArgs}`,
    {
      stdio: 'inherit',
      env: wranglerEnv(),
    },
  )
}

function runWranglerD1Pragma(args) {
  execSync(
    `pnpm exec wrangler --config ${WRANGLER_D1_CLI} d1 execute D1 --command "PRAGMA optimize" ${args}`,
    {
      stdio: 'inherit',
      env: wranglerEnv(),
    },
  )
}

runPayloadMigratePipeline(process.env)

const isCf = getDeploymentTargetFromEnv(process.env) === 'cloudflare'
const { payload: d1PayloadId, tagCache: d1TagId } = wranglerD1DatabaseIds()

if (isCf && process.env.SKIP_NEXT_TAG_CACHE_MIGRATIONS !== '1' && process.env.SKIP_NEXT_TAG_CACHE_MIGRATIONS !== 'true') {
  if (!d1TagId || d1TagId.includes('REPLACE')) {
    console.warn(
      '[migrate-production] NEXT_TAG_CACHE_D1 has no real database_id yet — skip OpenNext tag-cache D1 migrations.',
    )
  } else {
    const skipRemote =
      process.env.SKIP_D1_REMOTE_OPTIMIZE === '1' ||
      process.env.SKIP_D1_REMOTE_OPTIMIZE === 'true' ||
      !isLikelyValidD1Uuid(d1TagId)
    const remoteArgs = skipRemote ? '--local' : '--remote'
    try {
      runWranglerD1MigrationsApply('NEXT_TAG_CACHE_D1', remoteArgs)
    } catch {
      console.warn(
        `[migrate-production] wrangler d1 migrations apply NEXT_TAG_CACHE_D1 ${remoteArgs} failed — continuing.`,
      )
    }
  }
} else if (isCf && process.env.SKIP_NEXT_TAG_CACHE_MIGRATIONS === '1') {
  console.warn(
    '[migrate-production] SKIP_NEXT_TAG_CACHE_MIGRATIONS set — skipping wrangler d1 migrations apply NEXT_TAG_CACHE_D1.',
  )
}

const skipRemotePragma =
  process.env.SKIP_D1_REMOTE_OPTIMIZE === '1' ||
  process.env.SKIP_D1_REMOTE_OPTIMIZE === 'true' ||
  !isLikelyValidD1Uuid(d1PayloadId)

const skipAllPragma =
  process.env.SKIP_D1_PRAGMA === '1' ||
  process.env.SKIP_D1_PRAGMA === 'true' ||
  process.env.SKIP_D1_OPTIMIZE === '1'

if (isCf && !skipAllPragma) {
  if (!skipRemotePragma) {
    runWranglerD1Pragma('--remote')
  } else {
    try {
      runWranglerD1Pragma('--local')
    } catch {
      console.warn(
        '[migrate-production] Local `wrangler d1 execute … --local` failed or Wrangler has no local D1 yet — continuing.',
      )
    }
  }
}
