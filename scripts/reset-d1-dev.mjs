#!/usr/bin/env node
/**
 * **Local dev only:** deletes **`.wrangler/`** so Miniflare’s persisted D1 / Worker state is cleared.
 * Remote D1 is never touched. After this, run **`pnpm run db:migrate:local`** (or **`pnpm run db:fresh:local`**).
 *
 * @see https://developers.cloudflare.com/d1/best-practices/local-development/
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const wranglerDir = path.join(root, '.wrangler')

if (fs.existsSync(wranglerDir)) {
  fs.rmSync(wranglerDir, { recursive: true, force: true })
  console.log('[reset-d1-dev] Removed .wrangler/ — local D1 + Workers persistence cleared.')
} else {
  console.log('[reset-d1-dev] No .wrangler/ — nothing to remove.')
}

console.log('[reset-d1-dev] Next: pnpm run db:migrate:local')
