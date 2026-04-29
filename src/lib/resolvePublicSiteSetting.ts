import type { PublicSiteSetting } from '@types'

import { PUBLIC_SITE_SETTINGS_SLUG } from '@root/globals/globalSlugs'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

import { getPayload } from './getPayload'
import {
  resolveBooleanGlobalField,
  resolveGlobalField,
} from './resolveGlobalField'

/**
 * Merged shape for the `public-site-settings` global plus `NEXT_PUBLIC_*` env (mirrors field names on {@link PublicSiteSetting}).
 */
export type ResolvedPublicSiteSetting = {
  algoliaApplicationId: string
  algoliaCommunityIndexName: string
  algoliaDocsearchKey: string
  cloudCmsUrl: string
  cmsUrl: string
  enableBetaDocs: boolean
  enableLegacyDocs: boolean
  facebookPixelId: string
  gaMeasurementId: string
  gtmContainerId: string
  newsletterFormId: string
  recaptchaSiteKey: string
  siteUrl: string
}

/** Merge `Partial<PublicSiteSetting>` with `NEXT_PUBLIC_*` env (globals win when non-empty). */
export function resolvePublicSiteSettingFields(
  globalDoc: Partial<PublicSiteSetting>,
): ResolvedPublicSiteSetting {
  return {
    algoliaApplicationId: resolveGlobalField(
      globalDoc.algoliaApplicationId,
      process.env.NEXT_PUBLIC_ALGOLIA_CH_ID,
    ),
    algoliaCommunityIndexName: resolveGlobalField(
      globalDoc.algoliaCommunityIndexName,
      process.env.NEXT_PUBLIC_ALGOLIA_CH_INDEX_NAME,
    ),
    algoliaDocsearchKey: resolveGlobalField(
      globalDoc.algoliaDocsearchKey,
      process.env.NEXT_PUBLIC_ALGOLIA_DOCSEARCH_KEY,
    ),
    cloudCmsUrl: resolveGlobalField(globalDoc.cloudCmsUrl, process.env.NEXT_PUBLIC_CLOUD_CMS_URL),
    cmsUrl: resolveGlobalField(globalDoc.cmsUrl, process.env.NEXT_PUBLIC_CMS_URL),
    enableBetaDocs: resolveBooleanGlobalField(
      globalDoc.enableBetaDocs,
      process.env.NEXT_PUBLIC_ENABLE_BETA_DOCS,
    ),
    enableLegacyDocs: resolveBooleanGlobalField(
      globalDoc.enableLegacyDocs,
      process.env.NEXT_PUBLIC_ENABLE_LEGACY_DOCS,
    ),
    facebookPixelId: resolveGlobalField(
      globalDoc.facebookPixelId,
      process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
    ),
    gaMeasurementId: resolveGlobalField(
      globalDoc.gaMeasurementId,
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    ),
    gtmContainerId: resolveGlobalField(
      globalDoc.gtmContainerId,
      process.env.NEXT_PUBLIC_GTM_MEASUREMENT_ID,
    ),
    newsletterFormId: resolveGlobalField(
      globalDoc.newsletterFormId,
      process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ID,
    ),
    recaptchaSiteKey: resolveGlobalField(
      globalDoc.recaptchaSiteKey,
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    ),
    siteUrl: resolveGlobalField(globalDoc.siteUrl, process.env.NEXT_PUBLIC_SITE_URL),
  }
}

const loadResolved = async (): Promise<ResolvedPublicSiteSetting> => {
  const payload = await getPayload()
  const doc = await payload.findGlobal({
    slug: PUBLIC_SITE_SETTINGS_SLUG,
    depth: 0,
  })
  const globalDoc: Partial<PublicSiteSetting> =
    doc && typeof doc === 'object' ? (doc) : {}

  return resolvePublicSiteSettingFields(globalDoc)
}

const cachedResolved = unstable_cache(loadResolved, ['resolved-public-site-setting'], {
  tags: ['global-public-site-settings'],
})

/**
 * React `cache` dedupes layout + `generateMetadata` (same request). `unstable_cache`
 * dedupes across requests until `global-public-site-settings` is revalidated.
 */
export const resolvePublicSiteSetting = cache(async () => cachedResolved())

/** Client fallback when `SitePublicConfigProvider` is absent — env-only, same rules as server merge. */
export function resolvePublicSiteSettingFromEnvOnly(): ResolvedPublicSiteSetting {
  return resolvePublicSiteSettingFields({})
}
