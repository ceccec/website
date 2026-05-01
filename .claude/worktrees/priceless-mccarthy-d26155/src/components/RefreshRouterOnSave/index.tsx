'use client'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { resolveGlobalField } from '@root/lib/resolveGlobalField'
import { useSitePublicConfigOptional } from '@root/providers/SitePublicConfig'
import { useRouter } from 'next/navigation'
import React from 'react'

export const RefreshRouteOnSave: React.FC = () => {
  const router = useRouter()
  const site = useSitePublicConfigOptional()

  return (
    <PayloadLivePreview
      refresh={() => router.refresh()}
      serverURL={resolveGlobalField(site.siteUrl, process.env.NEXT_PUBLIC_SITE_URL)}
    />
  )
}
