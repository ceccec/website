import type { Payload } from 'payload'

import { multiTenantEnabled } from '@root/plugins/env'

import type { PublicSiteSettingOverrides } from './resolvePublicSiteSetting.shared'

/** Normalize request Host / X-Forwarded-Host (no port, lowercase). */
export function normalizeRequestHost(
  raw: null | string | undefined,
): string | undefined {
  if (!raw) {return undefined}
  const h = raw.split(':')[0].trim().toLowerCase()
  return h || undefined
}

function domainLookupVariants(host: string): string[] {
  const variants = new Set<string>([host])
  if (host.startsWith('www.')) {
    variants.add(host.slice(4))
  } else {
    variants.add(`www.${host}`)
  }
  return [...variants]
}

/**
 * Peel host labels so `app.example.com` → `app.example.com`, then `example.com` (apex manages `*.example.com`).
 * Single-label hosts (e.g. `localhost`) return themselves only.
 */
function hostSuffixChain(host: string): string[] {
  const labels = host.split('.').filter(Boolean)
  if (labels.length < 2) {
    return [host]
  }
  const out: string[] = []
  for (let start = 0; start <= labels.length - 2; start++) {
    out.push(labels.slice(start).join('.'))
  }
  return out
}

/**
 * Domains to match against `tenants.domain`, **most specific first** (longest suffix chain first),
 * then `www` / apex variants per suffix.
 */
export function orderedDomainCandidates(host: string): string[] {
  const ordered: string[] = []
  const seen = new Set<string>()
  for (const suffix of hostSuffixChain(host)) {
    for (const v of domainLookupVariants(suffix)) {
      if (!seen.has(v)) {
        seen.add(v)
        ordered.push(v)
      }
    }
  }
  return ordered
}

function candidateIndexForDoc(
  doc: Record<string, unknown>,
  candidates: string[],
): number {
  const raw = doc.domain
  if (typeof raw !== 'string') {return -1}
  const domain = raw.trim().toLowerCase()
  return candidates.indexOf(domain)
}

/**
 * Resolve tenant for public site config: **longest** matching `tenants.domain` wins.
 * An apex tenant (`example.com`) applies to all `*.example.com` when no row exists for a more specific host.
 * Uses Local API with override access — server-only; do not expose tenant lists publicly.
 */
export async function findTenantByRequestHost(
  payload: Payload,
  host: string,
): Promise<null | Record<string, unknown>> {
  if (!multiTenantEnabled()) {return null}

  const candidates = orderedDomainCandidates(host)
  if (candidates.length === 0) {return null}

  const res = await payload.find({
    // Collection exists when `PAYLOAD_MULTI_TENANT=true`; generated slugs may omit it when off.
    collection: 'tenants' as never,
    depth: 0,
    limit: candidates.length,
    overrideAccess: true,
    where: {
      domain: {
        in: candidates,
      },
    },
  })

  if (!res.docs.length) {return null}

  let best: null | Record<string, unknown> = null
  let bestIdx = Number.POSITIVE_INFINITY

  for (const doc of res.docs) {
    if (doc === null || typeof doc !== 'object') {continue}
    const row = doc as Record<string, unknown>
    const idx = candidateIndexForDoc(row, candidates)
    if (idx === -1) {continue}
    if (idx < bestIdx) {
      bestIdx = idx
      best = row
    }
  }

  return best
}

/** Map a tenant document to env merge overrides (same keys as {@link PublicSiteSettingOverrides}). */
export function tenantDocToPublicSiteOverrides(
  doc: Record<string, unknown>,
): PublicSiteSettingOverrides {
  return {
    algoliaApplicationId: pickString(doc.algoliaApplicationId),
    algoliaCommunityIndexName: pickString(doc.algoliaCommunityIndexName),
    algoliaDocsearchKey: pickString(doc.algoliaDocsearchKey),
    cloudCmsUrl: pickString(doc.cloudCmsUrl),
    cmsUrl: pickString(doc.cmsUrl),
    enableBetaDocs: pickBool(doc.enableBetaDocs),
    enableLegacyDocs: pickBool(doc.enableLegacyDocs),
    facebookPixelId: pickString(doc.facebookPixelId),
    gaMeasurementId: pickString(doc.gaMeasurementId),
    gtmContainerId: pickString(doc.gtmContainerId),
    newsletterFormId: pickString(doc.newsletterFormId),
    recaptchaSiteKey: pickString(doc.recaptchaSiteKey),
    siteUrl: pickString(doc.siteUrl),
  }
}

function pickString(v: unknown): null | string | undefined {
  if (v === null || v === undefined) {return undefined}
  if (typeof v === 'string') {return v.trim() === '' ? undefined : v}
  return String(v)
}

function pickBool(v: unknown): boolean | null | undefined {
  if (v === null || v === undefined) {return undefined}
  return Boolean(v)
}
