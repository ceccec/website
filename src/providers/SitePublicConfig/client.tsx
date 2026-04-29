'use client'

import type { MergedPublicSiteSettings } from '@root/lib/getMergedPublicSiteSettings'

import React, { createContext, useContext } from 'react'

const SitePublicConfigContext = createContext<MergedPublicSiteSettings | null>(null)

export function SitePublicConfigProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: MergedPublicSiteSettings
}) {
  return (
    <SitePublicConfigContext.Provider value={value}>{children}</SitePublicConfigContext.Provider>
  )
}

export function useSitePublicConfig(): MergedPublicSiteSettings {
  const ctx = useContext(SitePublicConfigContext)
  if (!ctx) {
    throw new Error('useSitePublicConfig must be used within SitePublicConfigProvider')
  }
  return ctx
}

/** Use in client trees that may render outside the provider (e.g. tests); falls back to build-time env. */
export function useSitePublicConfigOptional(): MergedPublicSiteSettings {
  const ctx = useContext(SitePublicConfigContext)
  if (ctx) {
    return ctx
  }
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
    cmsUrl: process.env.NEXT_PUBLIC_CMS_URL || '',
    cloudCmsUrl: process.env.NEXT_PUBLIC_CLOUD_CMS_URL || '',
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    gtmContainerId: process.env.NEXT_PUBLIC_GTM_MEASUREMENT_ID || '',
    facebookPixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '',
    enableBetaDocs: process.env.NEXT_PUBLIC_ENABLE_BETA_DOCS === 'true',
    enableLegacyDocs: process.env.NEXT_PUBLIC_ENABLE_LEGACY_DOCS === 'true',
    newsletterFormId: process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ID || '',
    recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    algoliaApplicationId: process.env.NEXT_PUBLIC_ALGOLIA_CH_ID || '',
    algoliaCommunityIndexName: process.env.NEXT_PUBLIC_ALGOLIA_CH_INDEX_NAME || '',
    algoliaDocsearchKey: process.env.NEXT_PUBLIC_ALGOLIA_DOCSEARCH_KEY || '',
  }
}
