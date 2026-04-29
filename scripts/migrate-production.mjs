#!/usr/bin/env node
/**
 * Runs `payload migrate` so the database matches `src/migrations` (Payload docs: database migrations).
 * That is the normal way to get a complete schema for local D1 / SSG and avoid missing-table errors.
 *
 * After migrate, optionally runs `wrangler d1 execute … PRAGMA optimize`:
 * - `--remote` when `wrangler.jsonc` has a real D1 UUID (unless `SKIP_D1_REMOTE_OPTIMIZE`);
 * - `--local` otherwise so local builds can use Wrangler’s local D1 without Cloudflare API.
 * Skip both with `SKIP_D1_PRAGMA=1` or `SKIP_D1_OPTIMIZE=1`.
 *
 * Escape hatches (use sparingly — see `.cursor/rules/payload-migrations.mdc`):
 * - `SKIP_DATABASE_MIGRATE=1` — skip `payload migrate` (e.g. building without a DB, or migrations applied elsewhere).
 * - `PAYLOAD_MIGRATE_ASSUME_YES=1` — answer “yes” if Payload warns about dev-mode schema drift (data loss risk; CI/ephemeral DB or explicit review only).
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

/** Align with `src/lib/deploymentTarget.ts` (runs in Node only — no Worker UA). */
function getDeploymentTarget() {
  if (process.env.PAYLOAD_HOSTING === 'vercel') return 'vercel'
  if (process.env.PAYLOAD_HOSTING === 'cloudflare') return 'cloudflare'
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent
    if (typeof ua === 'string' && ua.includes('Cloudflare-Workers')) return 'cloudflare'
  }
  if (
    process.env.PAYLOAD_DB_ADAPTER === 'mongodb' ||
    (process.env.MONGODB_URL && process.env.MONGODB_URL.trim().startsWith('mongodb')) ||
    (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().startsWith('mongodb'))
  ) {
    return 'vercel'
  }
  if (process.env.VERCEL === '1') return 'vercel'
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (url && /^postgres(ql)?:/i.test(url)) return 'vercel'
  return 'cloudflare'
}

/** First `database_id` under `d1_databases` in `wrangler.jsonc` (JSONC-safe via regex). */
function wranglerD1DatabaseId() {
  try {
    const text = fs.readFileSync(path.join(process.cwd(), 'wrangler.jsonc'), 'utf8')
    const m = text.match(/"database_id"\s*:\s*"([^"]+)"/)
    return m?.[1]?.trim() ?? ''
  } catch {
    return ''
  }
}

function isLikelyValidD1Uuid(id) {
  if (!id || id.includes('REPLACE')) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

function runWranglerD1Pragma(args) {
  execSync(
    `pnpm exec wrangler d1 execute D1 --command "PRAGMA optimize" ${args}`,
    { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production', PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'ignore' } },
  )
}

const env = {
  ...process.env,
  NODE_ENV: 'production',
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'ignore',
}

function runPayloadMigrate() {
  if (process.env.SKIP_DATABASE_MIGRATE === '1' || process.env.SKIP_DATABASE_MIGRATE === 'true') {
    console.warn(
      '[migrate-production] SKIP_DATABASE_MIGRATE set — skipping payload migrate. Prefer running migrations so schema matches src/migrations.',
    )
    return
  }

  const assumeYes =
    process.env.PAYLOAD_MIGRATE_ASSUME_YES === '1' ||
    process.env.PAYLOAD_MIGRATE_ASSUME_YES === 'true'

  if (assumeYes) {
    execSync('printf "y\\n" | pnpm exec payload migrate', { stdio: 'inherit', env, shell: true })
    return
  }

  execSync('pnpm exec payload migrate', { stdio: 'inherit', env })
}

runPayloadMigrate()

const d1Id = wranglerD1DatabaseId()
const skipRemote =
  process.env.SKIP_D1_REMOTE_OPTIMIZE === '1' ||
  process.env.SKIP_D1_REMOTE_OPTIMIZE === 'true' ||
  !isLikelyValidD1Uuid(d1Id)

const skipAllPragma =
  process.env.SKIP_D1_PRAGMA === '1' ||
  process.env.SKIP_D1_PRAGMA === 'true' ||
  process.env.SKIP_D1_OPTIMIZE === '1'

/** Prefer remote when you have a real D1 id; otherwise local Wrangler (miniflare) DB for dev builds. */
if (getDeploymentTarget() === 'cloudflare' && !skipAllPragma) {
  if (!skipRemote) {
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
