import { getDeploymentTargetFromEnv } from '../../scripts/lib/deploymentTarget.mjs'

/** Keep env-branch parity with `scripts/lib/deploymentTarget.mjs` when changing routing. */

export type DeploymentTarget = 'cloudflare' | 'vercel'

/** True inside Cloudflare Workers (`workerd`), not on plain Node. */
function isCloudflareWorkersRuntime(): boolean {
  if (typeof navigator === 'undefined') {return false}
  const ua = (navigator as { userAgent?: string }).userAgent
  return typeof ua === 'string' && ua.includes('Cloudflare-Workers')
}

/**
 * Wrangler / Workers → Cloudflare stack (D1, R2). Else → Vercel-style stack when on Vercel or Postgres is configured.
 *
 * Order: `PAYLOAD_HOSTING` → Workers runtime → env-based routing (see `scripts/lib/deploymentTarget.mjs`).
 */
export function getDeploymentTarget(): DeploymentTarget {
  if (process.env.PAYLOAD_HOSTING === 'vercel') {return 'vercel'}
  if (process.env.PAYLOAD_HOSTING === 'cloudflare') {return 'cloudflare'}

  // case: Wrangler / Workers runtime → Cloudflare
  if (isCloudflareWorkersRuntime()) {return 'cloudflare'}

  return getDeploymentTargetFromEnv(process.env)
}
