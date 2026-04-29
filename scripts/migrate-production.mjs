#!/usr/bin/env node
import { execSync } from 'node:child_process'

function getDeploymentTarget() {
  if (process.env.PAYLOAD_HOSTING === 'vercel') return 'vercel'
  if (process.env.PAYLOAD_HOSTING === 'cloudflare') return 'cloudflare'
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
