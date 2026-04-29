#!/usr/bin/env node
import { execSync } from 'node:child_process'

/** Align with `src/lib/deploymentTarget.ts` (runs in Node only — no Worker UA). */
function getDeploymentTarget() {
  if (process.env.PAYLOAD_HOSTING === 'vercel') return 'vercel'
  if (process.env.PAYLOAD_HOSTING === 'cloudflare') return 'cloudflare'
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent
    if (typeof ua === 'string' && ua.includes('Cloudflare-Workers')) return 'cloudflare'
  }
  if (process.env.VERCEL === '1') return 'vercel'
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (url && /^postgres(ql)?:/i.test(url)) return 'vercel'
  return 'cloudflare'
}

const env = {
  ...process.env,
  NODE_ENV: 'production',
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'ignore',
}

execSync('pnpm exec payload migrate', { stdio: 'inherit', env })

if (getDeploymentTarget() === 'cloudflare') {
  execSync('pnpm exec wrangler d1 execute D1 --command "PRAGMA optimize" --remote', {
    stdio: 'inherit',
    env,
  })
}
