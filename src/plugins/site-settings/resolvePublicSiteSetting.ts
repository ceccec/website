import { multiTenantEnabled } from '@root/plugins/env'
import { getPayload } from '@root/plugins/payload-runtime/getPayload'
import { payloadCacheKey, uuidTags } from '@uuid'
import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'
import { cache } from 'react'

import type { ResolvedPublicSiteSetting } from './resolvePublicSiteSetting.shared'

import { resolvePublicSiteSettingFields } from './resolvePublicSiteSetting.shared'
import {
  findTenantByRequestHost,
  normalizeRequestHost,
  tenantDocToPublicSiteOverrides,
} from './tenantPublicSite'

export type { ResolvedPublicSiteSetting } from './resolvePublicSiteSetting.shared'
export {
  resolvePublicSiteSettingFields,
  resolvePublicSiteSettingFromEnvOnly,
} from './resolvePublicSiteSetting.shared'

async function loadMergedForHost(hostKey: string): Promise<ResolvedPublicSiteSetting> {
  const host = hostKey || undefined
  if (!multiTenantEnabled() || !host) {
    return resolvePublicSiteSettingFields({})
  }

  try {
    const payload = await getPayload()
    const tenant = await findTenantByRequestHost(payload, host)
    if (!tenant) {
      return resolvePublicSiteSettingFields({})
    }

    return resolvePublicSiteSettingFields(tenantDocToPublicSiteOverrides(tenant))
  } catch {
    return resolvePublicSiteSettingFields({})
  }
}

/**
 * Public site config for this request: **`Host` / `X-Forwarded-Host`** vs **`tenants.domain`**
 * when `PAYLOAD_MULTI_TENANT=true`, merged with deployment **`NEXT_PUBLIC_*`** vars.
 * Outside Next (CLI/hooks), falls back to env-only merge.
 */
export const resolvePublicSiteSetting = cache(async (): Promise<ResolvedPublicSiteSetting> => {
  let hostKey = ''
  try {
    const h = await headers()
    hostKey = normalizeRequestHost(h.get('x-forwarded-host') ?? h.get('host')) ?? ''
  } catch {
    // Payload CLI / scripts — no Next request
  }

  if (!multiTenantEnabled()) {
    return resolvePublicSiteSettingFields({})
  }

  return unstable_cache(
    async () => loadMergedForHost(hostKey),
    payloadCacheKey({
      host: hostKey || 'none',
      op: 'resolvePublicSiteSetting',
    }),
    {
      tags: [uuidTags.tenantsPublicSite],
    },
  )()
})
