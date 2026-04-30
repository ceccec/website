#!/usr/bin/env node
/**
 * Ensures TypeScript passes, `CACHE_DEPTH` keys are used in `_data/index.ts`, and
 * `package.json` → `cloudflare.bindings` matches `config/cloudflare.bindings.json`.
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const pkgPath = join(root, 'package.json')
const cfBindingsPath = join(root, 'config', 'cloudflare.bindings.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const cf = JSON.parse(readFileSync(cfBindingsPath, 'utf8'))
const pkgCf = {
  introduction: pkg.cloudflare?.introduction ?? '',
  bindings: pkg.cloudflare?.bindings,
}
const srcCf = {
  introduction: cf.introduction ?? '',
  bindings: cf.bindings,
}
if (JSON.stringify(pkgCf) !== JSON.stringify(srcCf)) {
  console.error(
    'verify-payload-wiring: package.json `cloudflare` out of sync with config/cloudflare.bindings.json — run: node scripts/sync-cloudflare-bindings.mjs',
  )
  process.exit(1)
}

execSync('pnpm exec tsc --noEmit', { stdio: 'inherit', cwd: root })

const indexPath = join(root, 'src/app/_data/index.ts')
const depthsPath = join(root, 'src/app/_data/cacheDepths.ts')
const index = readFileSync(indexPath, 'utf8')
const depthsFile = readFileSync(depthsPath, 'utf8')

const body = depthsFile.match(/export const CACHE_DEPTH = \{([^}]+)\}/s)?.[1]
if (!body) {
  console.error('verify-payload-wiring: could not parse CACHE_DEPTH in cacheDepths.ts')
  process.exit(1)
}

const keys = [...body.matchAll(/^\s{2}(\w+):\s*\d+/gm)].map((m) => m[1])
const missing = keys.filter((k) => !index.includes(`CACHE_DEPTH.${k}`))

if (missing.length > 0) {
  console.error(
    'verify-payload-wiring: these CACHE_DEPTH keys are not used in src/app/_data/index.ts:',
    missing.join(', '),
  )
  process.exit(1)
}

console.log('verify-payload-wiring: OK (tsc + CACHE_DEPTH ↔ fetch + Cloudflare bindings sync)')
