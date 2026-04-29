#!/usr/bin/env node
/**
 * Default `pnpm build` must work for both Vercel (Postgres + `next build`) and Cloudflare
 * (D1 + OpenNext). CI has no Workers `navigator` — mirror Node-side rules from
 * `src/lib/deploymentTarget.ts`.
 */
import { execSync } from 'node:child_process'

function deploymentTargetForCi() {
  if (process.env.PAYLOAD_HOSTING === 'vercel') return 'vercel'
  if (process.env.PAYLOAD_HOSTING === 'cloudflare') return 'cloudflare'
  if (process.env.VERCEL === '1') return 'vercel'
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
  if (url && /^postgres(ql)?:/i.test(url)) return 'vercel'
  return 'cloudflare'
}

const vercelPipeline =
  'pnpm generate:llms && pnpm exec payload migrate && cross-env NODE_OPTIONS=--no-deprecation next build'

if (deploymentTargetForCi() === 'vercel') {
  execSync(vercelPipeline, { stdio: 'inherit', env: process.env })
} else {
  execSync('pnpm run workers:build', { stdio: 'inherit', env: process.env })
}
