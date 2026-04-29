#!/usr/bin/env node
/**
 * Single source of truth: `config/cloudflare.bindings.json` → `package.json` → `cloudflare`.
 * Run after editing binding descriptions: `pnpm exec node scripts/sync-cloudflare-bindings.mjs`
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

pkg.cloudflare = cf

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
