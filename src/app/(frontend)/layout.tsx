import type { Metadata } from 'next'

import { GoogleAnalytics } from '@components/Analytics/GoogleAnalytics/index'
import { GoogleTagManager } from '@components/Analytics/GoogleTagManager/index'
import { PrivacyBanner } from '@components/PrivacyBanner/index'
import { Providers } from '@providers/index'
import { resolveGlobalField } from '@root/lib/resolveGlobalField'
import { resolvePublicSiteSetting } from '@root/lib/resolvePublicSiteSetting'
import { PrivacyProvider } from '@root/providers/Privacy/index'
import { SitePublicConfigProvider } from '@root/providers/SitePublicConfig'
import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { GeistMono } from 'geist/font/mono'
import React from 'react'

import { untitledSans } from './fonts'
import '../../css/app.scss'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sitePublic = await resolvePublicSiteSetting()

  return (
    <html lang="en">
      <PrivacyProvider>
        <head>
          <link href="/images/favicon.svg" rel="icon" />
          {sitePublic.cloudCmsUrl ? (
            <link href={sitePublic.cloudCmsUrl} rel="dns-prefetch" />
          ) : null}
          <link href="https://api.github.com/repos/ceccec/website" rel="dns-prefetch" />
          <link href="https://cdn.jsdelivr.net/npm/@docsearch/css@3" rel="stylesheet" />
          <link href="https://www.googletagmanager.com" rel="preconnect" />
          <link href="https://www.google-analytics.com" rel="preconnect" />
          <GoogleAnalytics
            facebookPixelId={sitePublic.facebookPixelId}
            gaMeasurementId={sitePublic.gaMeasurementId}
          />
        </head>
        <body className={[GeistMono.variable, untitledSans.variable].join(' ')}>
          <SitePublicConfigProvider value={sitePublic}>
            <GoogleTagManager gtmContainerId={sitePublic.gtmContainerId} />
            <Providers>
              {children}
              <PrivacyBanner />
            </Providers>
          </SitePublicConfigProvider>
        </body>
      </PrivacyProvider>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteUrl } = await resolvePublicSiteSetting()
  return {
    metadataBase: new URL(
      resolveGlobalField(siteUrl, process.env.NEXT_PUBLIC_SITE_URL) || 'https://payloadcms.com',
    ),
    openGraph: mergeOpenGraph(),
    twitter: {
      card: 'summary_large_image',
      creator: '@payloadcms',
    },
  }
}
