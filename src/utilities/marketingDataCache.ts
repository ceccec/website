/**
 * Payload marketing `find`s + `unstable_cache` + next-intl locale.
 * Dynamic APIs (`getLocale`, `draftMode`, `resolvePayloadLocale`) stay **outside** cache callbacks.
 * All memoized keys use {@link payloadCacheKey} from `@uuid` (UUID v5); cache entries carry **tags**
 * aligned with {@link uuidTags} + Payload hooks (`revalidateTag`).
 */

import type { CommunityHelp } from '@root/payload-types'
import type { TypedLocale } from 'payload'

import { type PayloadLocale } from '@root/i18n/payloadLocale'
import { ARCHIVES_CACHE_TAG } from '@root/utilities/revalidateMarketingRoutes'
import { payloadCacheKey, uuidTags } from '@uuid'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getLocale } from 'next-intl/server'

/**
 * Optional `{ draft, locale }` argument accepted by marketing fetchers when invoked from a
 * cached (non-draft) context. `locale` is a {@link PayloadLocale} because the generated
 * `TypedLocale` resolves to `null` in this project (localization is configured at runtime).
 */
export type DraftLocaleOpt = {
  draft?: boolean
  locale?: PayloadLocale
}

/** `cachedSlugDraftLocale` namespace → Payload collection slug for {@link uuidTags.collectionSlug}. */
const MARKETING_NAMESPACE_COLLECTION: Record<string, string> = {
  'blogPost': 'posts',
  'case-study': 'case-studies',
  'community-help': 'community-help',
  page: 'pages',
  partner: 'partners',
}

/** Single source of the request locale wherever we pair Payload locale with next-intl. */
export async function getRequestLocale(): Promise<PayloadLocale> {
  return await getLocale()
}

/**
 * When `draft` is on, run `uncached`. Otherwise memoize `cached` with
 * `payloadCacheKey(cacheShape)`.
 */
export function runDraftLocaleCache<R>(
  draft: boolean,
  locale: PayloadLocale,
  cacheShape: Record<string, unknown>,
  uncached: () => Promise<R>,
  cached: () => Promise<R>,
  cacheOptions?: { revalidate?: false | number; tags?: string[] },
): Promise<R> {
  if (draft) {
    return uncached()
  }
  return unstable_cache(cached, [payloadCacheKey(cacheShape)], cacheOptions)()
}

/** Read draft flag once for pages that call multiple cached helpers. */
export async function readDraftMode(): Promise<boolean> {
  return (await draftMode()).isEnabled
}

/** Detail rows keyed by slug — case studies, partners (`DraftLocaleOpt`). */
export async function cachedSlugDraftLocale<R>(
  slug: string,
  draft: boolean,
  find: (slug: string, options?: DraftLocaleOpt) => Promise<R>,
  cacheNamespace: string,
  depthKey: string,
): Promise<R> {
  const locale = await getRequestLocale()
  const collection = MARKETING_NAMESPACE_COLLECTION[cacheNamespace]
  const tags =
    collection !== undefined ? [uuidTags.collectionSlug(collection, slug)] : undefined

  return runDraftLocaleCache(
    draft,
    locale,
    {
      slug,
      cacheNamespace,
      depthKey,
      kind: 'marketing',
      locale,
      variant: 'slugDraftLocale',
    },
    () => find(slug),
    () => find(slug, { draft: false, locale }),
    tags ? { tags } : undefined,
  )
}

/** Catch-all CMS pages — `fetchPage(segments[], options?)`. */
export async function cachedPageSegmentsDraftLocale<R>(
  segments: string[],
  draft: boolean,
  find: (incomingSlugSegments: string[], options?: DraftLocaleOpt) => Promise<R>,
  cacheNamespace: string,
  depthKey: string,
): Promise<R> {
  const locale = await getRequestLocale()
  const pathKey = Array.isArray(segments) ? segments.join('/') : String(segments)
  const lastSlug =
    Array.isArray(segments) && segments.length > 0 ? segments[segments.length - 1] : pathKey

  return runDraftLocaleCache(
    draft,
    locale,
    {
      cacheNamespace,
      depthKey,
      kind: 'marketing',
      locale,
      pathKey,
      variant: 'pageSegments',
    },
    () => find(segments),
    () => find(segments, { draft: false, locale }),
    { tags: [uuidTags.collectionSlug('pages', lastSlug)] },
  )
}

/** Blog post: slug + category (`DraftLocaleOpt`). */
export async function cachedBlogDetailDraftLocale<R>(
  slug: string,
  categorySlug: string,
  draft: boolean,
  find: (slug: string, categorySlug: string, options?: DraftLocaleOpt) => Promise<R>,
  cacheNamespace: string,
  depthKey: string,
): Promise<R> {
  const locale = await getRequestLocale()
  return runDraftLocaleCache(
    draft,
    locale,
    {
      slug,
      cacheNamespace,
      categorySlug,
      depthKey,
      kind: 'marketing',
      locale,
      variant: 'blogDetail',
    },
    () => find(slug, categorySlug),
    () => find(slug, categorySlug, { draft: false, locale }),
    { tags: [uuidTags.collectionSlug('posts', slug)] },
  )
}

/** Community-help single doc — locale arg only (no draft field on fetcher). */
export async function cachedSlugLocaleOnly<R>(
  slug: string,
  draft: boolean,
  find: (slug: string, localeArg?: PayloadLocale) => Promise<R>,
  cacheNamespace: string,
  depthKey: string,
): Promise<R> {
  const locale = await getRequestLocale()
  return runDraftLocaleCache(
    draft,
    locale,
    {
      slug,
      cacheNamespace,
      depthKey,
      kind: 'marketing',
      locale,
      variant: 'slugLocaleOnly',
    },
    () => find(slug),
    () => find(slug, locale),
    { tags: [uuidTags.collectionSlug('community-help', slug)] },
  )
}

/** Category archive — `fetchArchive(slug, draft?, locale?)`. */
export async function cachedArchiveByCategory<R>(
  categorySlug: string,
  draft: boolean,
  find: (slug: string, draftArg?: boolean, localeArg?: PayloadLocale) => Promise<R>,
  depthKey: string,
): Promise<R> {
  const locale = await getRequestLocale()
  return runDraftLocaleCache(
    draft,
    locale,
    {
      categorySlug,
      depthKey,
      kind: 'marketing',
      locale,
      variant: 'archiveByCategory',
    },
    () => find(categorySlug, draft),
    () => find(categorySlug, false, locale),
    {
      tags: [ARCHIVES_CACHE_TAG, uuidTags.archivesCategory(categorySlug)],
    },
  )
}

/** Zero-arg list fetchers — pass locale into `find(locale)`. */
export async function cachedLocaleList<R>(
  find: (localeArg?: PayloadLocale) => Promise<R>,
  cacheKeyPrefix: readonly string[],
  cacheOptions?: { revalidate?: false | number; tags?: string[] },
): Promise<R> {
  const locale = await getRequestLocale()
  const primaryKey = String(cacheKeyPrefix[0] ?? 'marketing')
  const listTag = uuidTags.localeList(primaryKey)
  const mergedTags = [...new Set([listTag, ...(cacheOptions?.tags ?? [])])]
  const mergedOptions = {
    ...cacheOptions,
    tags: mergedTags,
  }
  return unstable_cache(
    () => find(locale),
    [
      payloadCacheKey({
        kind: 'marketing',
        locale,
        prefix: [...cacheKeyPrefix],
        variant: 'localeList',
      }),
    ],
    mergedOptions,
  )()
}

/** List community-help slugs by channel — `fetchCommunityHelps(type, locale?)`. */
export async function cachedCommunityHelpsByType<R>(
  type: CommunityHelp['communityHelpType'],
  draft: boolean,
  find: (communityHelpType: CommunityHelp['communityHelpType'], localeArg?: PayloadLocale) => Promise<R>,
  cacheNamespace: string,
  depthKey: string,
): Promise<R> {
  const locale = await getRequestLocale()
  return runDraftLocaleCache(
    draft,
    locale,
    {
      type: String(type),
      cacheNamespace,
      depthKey,
      kind: 'marketing',
      locale,
      variant: 'communityHelpsByType',
    },
    () => find(type),
    () => find(type, locale),
    { tags: [uuidTags.communityHelpTypeList(String(type)), uuidTags.communityHelp] },
  )
}
