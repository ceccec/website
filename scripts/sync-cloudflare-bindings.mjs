#!/usr/bin/env node
/**
 * Single source of truth: `config/cloudflare.bindings.json` → `package.json` → `cloudflare.bindings`.
 * Optional root `introduction` in the JSON file is not copied (Deploy wizard reads only `bindings`).
 * Run after editing: `pnpm exec node scripts/sync-cloudflare-bindings.mjs`
 * https://developers.cloudflare.com/workers/platform/deploy-buttons/#worker-environment-variables-and-secrets
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

/** Cloudflare Deploy UI reads only `package.json` → `cloudflare.bindings`. Optional `introduction` in the JSON file is docs-only (not copied). */
pkg.cloudflare = { bindings }

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
