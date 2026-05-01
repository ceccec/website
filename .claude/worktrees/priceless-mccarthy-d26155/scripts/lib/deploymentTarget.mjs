/**
 * Node-safe deployment routing (no `navigator`). Used by `scripts/build.mjs` and
 * `src/lib/deploymentTarget.ts` — keep env-branch parity with that file’s Workers + `PAYLOAD_HOSTING` logic.
 */
export function getDeploymentTargetFromEnv(env = process.env) {
  if (env.PAYLOAD_HOSTING === 'vercel') return 'vercel'
  if (env.PAYLOAD_HOSTING === 'cloudflare') return 'cloudflare'
  if (
    env.PAYLOAD_DB_ADAPTER?.toLowerCase() === 'mongodb' ||
    env.MONGODB_URL?.trim().startsWith('mongodb') ||
    env.DATABASE_URL?.trim().startsWith('mongodb')
  ) {
    return 'vercel'
  }
  if (env.VERCEL === '1') return 'vercel'
  const url = env.POSTGRES_URL || env.DATABASE_URL
  if (url && /^postgres(ql)?:/i.test(url)) return 'vercel'
  return 'cloudflare'
}
