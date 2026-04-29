export type DeploymentTarget = 'cloudflare' | 'vercel'

/** True inside Cloudflare Workers (`workerd`), not on plain Node. */
function isCloudflareWorkersRuntime(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = (navigator as { userAgent?: string }).userAgent
  return typeof ua === 'string' && ua.includes('Cloudflare-Workers')
}

/**
 * Wrangler / Workers → Cloudflare stack (D1, R2). Else → Vercel-style stack when on Vercel or Postgres is configured.
 *
 * Order: `PAYLOAD_HOSTING` → Workers runtime → `VERCEL=1` → `postgres://…` URL → default Cloudflare (covers Node migrate/CI without Worker UA).
 */
export function getDeploymentTarget(): DeploymentTarget {
  if (process.env.PAYLOAD_HOSTING === 'vercel') return 'vercel'
  if (process.env.PAYLOAD_HOSTING === 'cloudflare') return 'cloudflare'

  // case: Wrangler / Workers runtime → Cloudflare
  if (isCloudflareWorkersRuntime()) return 'cloudflare'

  // case: Vercel platform (build + Node runtime there)
  if (process.env.VERCEL === '1') return 'vercel'

  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (url && /^postgres(ql)?:/i.test(url)) return 'vercel'

  // Node without Worker UA (e.g. wrangler d1 execute, migrate script): prefer D1 path unless Postgres set above
  return 'cloudflare'
}
