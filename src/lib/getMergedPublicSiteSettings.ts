import type { PublicSiteSetting } from '@types'

import { unstable_cache } from 'next/cache'
import { cache } from 'react'

import { getPayload } from './getPayload'

export type MergedPublicSiteSettings = {
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

function pickString(v: unknown): string {
  return typeof v === 'string' && v.trim() ? v.trim() : ''
}

function boolOrEnv(
  field: boolean | null | undefined,
  envVal: string | undefined,
): boolean {
  if (field === true) {
    return true
  }
  if (field === false) {
    return false
  }
  return envVal === 'true'
}

const loadMerged = async (): Promise<MergedPublicSiteSettings> => {
  const payload = await getPayload()
  const doc = await payload.findGlobal({
    slug: 'public-site-settings',
    depth: 0,
  })
  const g: Partial<PublicSiteSetting> =
    doc && typeof doc === 'object' ? (doc as PublicSiteSetting) : {}

  return {
    siteUrl: pickString(g.siteUrl) || process.env.NEXT_PUBLIC_SITE_URL || '',
    cmsUrl: pickString(g.cmsUrl) || process.env.NEXT_PUBLIC_CMS_URL || '',
    cloudCmsUrl: pickString(g.cloudCmsUrl) || process.env.NEXT_PUBLIC_CLOUD_CMS_URL || '',
    gaMeasurementId:
      pickString(g.gaMeasurementId) || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    gtmContainerId:
      pickString(g.gtmContainerId) || process.env.NEXT_PUBLIC_GTM_MEASUREMENT_ID || '',
    facebookPixelId:
      pickString(g.facebookPixelId) || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '',
    enableBetaDocs: boolOrEnv(g.enableBetaDocs, process.env.NEXT_PUBLIC_ENABLE_BETA_DOCS),
    enableLegacyDocs: boolOrEnv(g.enableLegacyDocs, process.env.NEXT_PUBLIC_ENABLE_LEGACY_DOCS),
    newsletterFormId:
      pickString(g.newsletterFormId) || process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ID || '',
    recaptchaSiteKey:
      pickString(g.recaptchaSiteKey) || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    algoliaApplicationId:
      pickString(g.algoliaApplicationId) || process.env.NEXT_PUBLIC_ALGOLIA_CH_ID || '',
    algoliaCommunityIndexName:
      pickString(g.algoliaCommunityIndexName) ||
      process.env.NEXT_PUBLIC_ALGOLIA_CH_INDEX_NAME ||
      '',
    algoliaDocsearchKey:
      pickString(g.algoliaDocsearchKey) || process.env.NEXT_PUBLIC_ALGOLIA_DOCSEARCH_KEY || '',
  }
}

const cachedMerged = unstable_cache(loadMerged, ['merged-public-site-settings'], {
  tags: ['global-public-site-settings'],
})

/**
 * React `cache` dedupes layout + `generateMetadata` (same request). `unstable_cache`
 * dedupes across requests until `global-public-site-settings` is revalidated.
 */
export const getMergedPublicSiteSettings = cache(async () => cachedMerged())
