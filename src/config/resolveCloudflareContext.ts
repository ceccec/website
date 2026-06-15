import type { CloudflareContext } from '@opennextjs/cloudflare'

import {
  getCloudflareContextFromWrangler,
  WRANGLER_PAYLOAD_CLI_CONFIG,
} from './getCloudflareContextFromWrangler'

/** True inside the Cloudflare Workers runtime (`workerd`), not plain Node. */
function isCloudflareWorkersRuntime(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  const ua = (navigator as { userAgent?: string }).userAgent
  return typeof ua === 'string' && ua.includes('Cloudflare-Workers')
}

/**
 * Resolves the Cloudflare bindings (D1, R2, …) for the Payload config at module-eval time.
 *
 * - **Workers runtime** (deployed Worker): `getCloudflareContext({ async: true })` from
 *   `@opennextjs/cloudflare` — imported lazily so the dependency is never pulled into the Node CLI.
 * - **Node** (`payload migrate`, `generate:types`, `next build`): Wrangler's `getPlatformProxy`
 *   against `wrangler.payload-cli.jsonc` (slim D1+R2 config). Set `CLOUDFLARE_REMOTE_BINDINGS=true`
 *   to target the provisioned remote D1 during CI/build migrations.
 *
 * Only call this when the deployment target is Cloudflare — on Node/Vercel (Mongo/Postgres) the
 * bindings are unused and the Wrangler proxy would be unnecessary work.
 */
export async function resolveCloudflareContext(): Promise<CloudflareContext | undefined> {
  if (isCloudflareWorkersRuntime()) {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    return getCloudflareContext({ async: true })
  }
  return getCloudflareContextFromWrangler(WRANGLER_PAYLOAD_CLI_CONFIG)
}
