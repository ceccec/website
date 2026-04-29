#!/usr/bin/env node
/**
 * Ensures TypeScript passes and every `CACHE_DEPTH` key is referenced in `fetch*` (`_data/index.ts`)
 * so query depth stays aligned with `unstable_cache` keys.
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

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

console.log('verify-payload-wiring: OK (tsc + CACHE_DEPTH ↔ fetch layer)')
