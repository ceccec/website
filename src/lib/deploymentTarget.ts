export type DeploymentTarget = 'cloudflare' | 'vercel'

export function getDeploymentTarget(): DeploymentTarget {
  if (process.env.PAYLOAD_HOSTING === 'vercel') return 'vercel'
  if (process.env.PAYLOAD_HOSTING === 'cloudflare') return 'cloudflare'
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (url && /^postgres(ql)?:/i.test(url)) return 'vercel'
  return 'cloudflare'
}
