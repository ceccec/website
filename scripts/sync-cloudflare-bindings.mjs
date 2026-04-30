#!/usr/bin/env node
/**
 * Mirrors optional `package.json` → `cloudflare` → `bindings` from the Deploy docs:
 * https://developers.cloudflare.com/workers/platform/deploy-buttons/#best-practices
 * Source: `config/cloudflare.bindings.json`. Run: `pnpm exec node scripts/sync-cloudflare-bindings.mjs`
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = path.join(root, 'package.json')
const cfPath = path.join(root, 'config', 'cloudflare.bindings.json')

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const cf = JSON.parse(fs.readFileSync(cfPath, 'utf8'))

const { bindings } = cf
if (!bindings || typeof bindings !== 'object') {
  throw new Error('config/cloudflare.bindings.json must include a `bindings` object')
}

pkg.cloudflare = { bindings }

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
