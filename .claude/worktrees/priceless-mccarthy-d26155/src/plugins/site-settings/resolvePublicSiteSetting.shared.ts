import { resolveBooleanGlobalField, resolveFirstEnvValue } from './resolveGlobalField'

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

/** Optional document overrides (unused — env-only path passes `{}`). Kept for testing or future merge layers. */
export type PublicSiteSettingOverrides = Partial<{
  [K in keyof ResolvedPublicSiteSetting]: null | ResolvedPublicSiteSetting[K]
}>

export function resolvePublicSiteSettingFields(
  globalDoc: PublicSiteSettingOverrides,
): ResolvedPublicSiteSetting {
  return {
    algoliaApplicationId: resolveFirstEnvValue(
      globalDoc.algoliaApplicationId,
      process.env.NEXT_PUBLIC_ALGOLIA_CH_ID,
    ),
    algoliaCommunityIndexName: resolveFirstEnvValue(
      globalDoc.algoliaCommunityIndexName,
      process.env.NEXT_PUBLIC_ALGOLIA_CH_INDEX_NAME,
    ),
    algoliaDocsearchKey: resolveFirstEnvValue(
      globalDoc.algoliaDocsearchKey,
      process.env.NEXT_PUBLIC_ALGOLIA_DOCSEARCH_KEY,
    ),
    cloudCmsUrl: resolveFirstEnvValue(globalDoc.cloudCmsUrl, process.env.NEXT_PUBLIC_CLOUD_CMS_URL),
    cmsUrl: resolveFirstEnvValue(globalDoc.cmsUrl, process.env.NEXT_PUBLIC_CMS_URL),
    enableBetaDocs: resolveBooleanGlobalField(
      globalDoc.enableBetaDocs,
      process.env.NEXT_PUBLIC_ENABLE_BETA_DOCS,
    ),
    enableLegacyDocs: resolveBooleanGlobalField(
      globalDoc.enableLegacyDocs,
      process.env.NEXT_PUBLIC_ENABLE_LEGACY_DOCS,
    ),
    facebookPixelId: resolveFirstEnvValue(
      globalDoc.facebookPixelId,
      process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
    ),
    gaMeasurementId: resolveFirstEnvValue(
      globalDoc.gaMeasurementId,
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    ),
    gtmContainerId: resolveFirstEnvValue(
      globalDoc.gtmContainerId,
      process.env.NEXT_PUBLIC_GTM_MEASUREMENT_ID,
    ),
    newsletterFormId: resolveFirstEnvValue(
      globalDoc.newsletterFormId,
      process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ID,
    ),
    recaptchaSiteKey: resolveFirstEnvValue(
      globalDoc.recaptchaSiteKey,
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    ),
    siteUrl: resolveFirstEnvValue(globalDoc.siteUrl, process.env.NEXT_PUBLIC_SITE_URL),
  }
}

export function resolvePublicSiteSettingFromEnvOnly(): ResolvedPublicSiteSetting {
  return resolvePublicSiteSettingFields({})
}
