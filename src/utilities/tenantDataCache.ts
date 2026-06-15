/**
 * **Next.js + Payload** (same discipline as `marketingDataCache.ts`):
 *
 * 1. Read [dynamic request APIs](https://nextjs.org/docs/app/getting-started/caching#dynamic-rendering)
 *    (`headers`, etc.) **outside** [`unstable_cache`](https://nextjs.org/docs/app/api-reference/functions/unstable_cache).
 * 2. Derive tenant scope from `Host` → `resolveContentTenantIdsForHost` in `plugins/multi-tenant/tenantHierarchy.ts`,
 *    and put **`tenantIds` in the cache key** with `payloadCacheKey` from `@uuid`.
 * 3. Inside the cached callback, use `getPayload` + Local API `find` with
 *    `where: { and: [whereTenantIn(tenantIds), …] }` ([Local API](https://payloadcms.com/docs/local-api/overview)).
 *
 * Invalidate with [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag):
 * `uuidTags.tenantsPublicSite` when tenant rows change; collection tags on publish — see `next-caching-revalidation.mdc`.
 */

import type { Where } from 'payload'

import { multiTenantEnabled } from '@root/plugins/env'
import {
  resolveContentTenantIdsForHost,
  whereTenantIn,
} from '@root/plugins/multi-tenant/tenantHierarchy'
import { getPayload } from '@root/plugins/payload-runtime/getPayload'
import {
  normalizeRequestHost,
} from '@root/plugins/site-settings/tenantPublicSite'
import { payloadCacheKey, uuidTags } from '@uuid'
import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'

/** Resolve `Host` / `X-Forwarded-Host` → tenant ids for this request (merge + domain chain). */
export async function getTenantContentScopeIdsForRequest(): Promise<(number | string)[]> {
  if (!multiTenantEnabled()) {return []}
  try {
    const h = await headers()
    const host = normalizeRequestHost(h.get('x-forwarded-host') ?? h.get('host'))
    if (!host) {return []}
    const payload = await getPayload()
    return resolveContentTenantIdsForHost(payload, host)
  } catch {
    return []
  }
}

export type TenantScopeContext = {
  tenantIds: (number | string)[]
  /** `null` when there is no tenant scope (merge `where` only when non-null). */
  whereTenant: null | Where
}

/** Build `where` fragment for the default multi-tenant `tenant` field, or `null` if no ids. */
export function tenantWhereFromIds(
  tenantIds: (number | string)[],
): null | Where {
  if (tenantIds.length === 0) {return null}
  return whereTenantIn(tenantIds)
}

/**
 * Resolve tenant scope from the request, then memoize `run` with that scope baked into the key.
 * Always tags `uuidTags.tenantsPublicSite` so tenant edits (domain, merge, hierarchy) bust entries.
 *
 * When **`tenantIds` is empty** (`PAYLOAD_MULTI_TENANT` off or host unmatched), `whereTenant` is `null` —
 * run `find` without a tenant constraint (or short-circuit to empty results), matching non-MT deploys.
 */
export async function cachedWithTenantScope<R>(
  cacheShape: Record<string, unknown>,
  run: (ctx: TenantScopeContext) => Promise<R>,
  options?: { tags?: string[] },
): Promise<R> {
  const tenantIds = await getTenantContentScopeIdsForRequest()
  const whereTenant = tenantWhereFromIds(tenantIds)
  const tags = [
    uuidTags.tenantsPublicSite,
    ...(options?.tags ?? []),
  ]
  return unstable_cache(
    async () => run({ tenantIds, whereTenant }),
    [payloadCacheKey({ ...cacheShape, tenantIds })],
    { tags },
  )()
}
