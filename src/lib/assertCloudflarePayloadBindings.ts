import type { CloudflareContext } from '@opennextjs/cloudflare'

import type { DeploymentTarget } from './deploymentTarget'

/**
 * Payload on Cloudflare requires Wrangler bindings declared for this app:
 * `D1` (@payloadcms/db-d1-sqlite) and `R2` (@payloadcms/storage-r2 media).
 * Optional OpenNext bindings (ASSETS, NEXT_INC_CACHE_R2_BUCKET, …) are enforced elsewhere.
 */
export function assertCloudflarePayloadBindings(
  deploymentTarget: DeploymentTarget,
  cloudflare: CloudflareContext | undefined,
): asserts cloudflare is CloudflareContext {
  if (deploymentTarget !== 'cloudflare') {return}

  if (!cloudflare?.env) {
    throw new Error(
      '[Payload + Cloudflare] Missing Cloudflare context. Ensure you run on Workers with OpenNext, ' +
        'or locally via `wrangler dev` / `getPlatformProxy`. See wrangler.jsonc (d1_databases, r2_buckets).',
    )
  }

  const { D1, R2 } = cloudflare.env
  if (!D1) {
    throw new Error(
      '[Payload + Cloudflare] Binding `D1` is required for sqliteD1Adapter. Declared in wrangler.jsonc under `d1_databases`.',
    )
  }
  if (!R2) {
    throw new Error(
      '[Payload + Cloudflare] Binding `R2` is required for @payloadcms/storage-r2. Declared in wrangler.jsonc under `r2_buckets` (media bucket).',
    )
  }
}
