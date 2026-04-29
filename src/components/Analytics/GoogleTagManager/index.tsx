'use client'

import { resolveGlobalField } from '@root/lib/resolveGlobalField'
import { usePrivacy } from '@root/providers/Privacy/index'
import Script from 'next/script'
import React, { Fragment } from 'react'

type Props = {
  gtmContainerId?: string
}

export const GoogleTagManager: React.FC<Props> = ({ gtmContainerId: gtmProp }) => {
  const { cookieConsent } = usePrivacy()

  const gtmContainerId = resolveGlobalField(gtmProp, process.env.NEXT_PUBLIC_GTM_MEASUREMENT_ID)

  if (!cookieConsent || !gtmContainerId) {
    return null
  }

  return (
    <Fragment>
      <Script
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmContainerId}');`,
        }}
        defer
        id="google-tag-manager"
      />

      <noscript>
        <iframe
          height="0"
          src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
          style={{
            display: 'none',
            visibility: 'hidden',
          }}
          title="Google Tag Manager"
          width="0"
        />
      </noscript>
    </Fragment>
  )
}
