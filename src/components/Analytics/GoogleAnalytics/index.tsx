'use client'

import { resolveGlobalField } from '@root/lib/resolveGlobalField'
import { usePrivacy } from '@root/providers/Privacy/index'
import { analyticsEvent } from '@root/utilities/analytics'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import * as React from 'react'

type Props = {
  facebookPixelId?: string
  gaMeasurementId?: string
}

export const GoogleAnalytics: React.FC<Props> = ({
  facebookPixelId: fbProp,
  gaMeasurementId: gaProp,
}) => {
  const pathname = usePathname()

  const { cookieConsent } = usePrivacy()

  const gaMeasurementId = resolveGlobalField(gaProp, process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)

  React.useEffect(() => {
    if (!gaMeasurementId || !window?.location?.href) {
      return
    }

    analyticsEvent(
      'page_view',
      {
        page_location: window.location.href,
        page_path: pathname,
        page_title: document.title,
      },
      {
        facebookPixelId: resolveGlobalField(fbProp, process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID),
        gaMeasurementId,
      },
    )
  }, [pathname, gaMeasurementId, fbProp])

  if (!cookieConsent || !gaMeasurementId) {
    return null
  }

  return (
    <React.Fragment>
      <Script defer src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} />
      <Script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaMeasurementId}', { send_page_view: false });`,
        }}
        defer
        id="google-analytics"
      />
    </React.Fragment>
  )
}
