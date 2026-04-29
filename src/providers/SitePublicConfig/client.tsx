'use client'

import {
  type ResolvedPublicSiteSetting,
  resolvePublicSiteSettingFromEnvOnly,
} from '@root/lib/resolvePublicSiteSetting'
import React, { createContext, use } from 'react'

const SitePublicConfigContext = createContext<null | ResolvedPublicSiteSetting>(null)

export function SitePublicConfigProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: ResolvedPublicSiteSetting
}) {
  return (
    <SitePublicConfigContext value={value}>{children}</SitePublicConfigContext>
  )
}

export function useSitePublicConfig(): ResolvedPublicSiteSetting {
  const ctx = use(SitePublicConfigContext)
  if (!ctx) {
    throw new Error('useSitePublicConfig must be used within SitePublicConfigProvider')
  }
  return ctx
}

/** Use in client trees that may render outside the provider (e.g. tests); falls back to build-time env. */
export function useSitePublicConfigOptional(): ResolvedPublicSiteSetting {
  const ctx = use(SitePublicConfigContext)
  if (ctx) {
    return ctx
  }
  return resolvePublicSiteSettingFromEnvOnly()
}
