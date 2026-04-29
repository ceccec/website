import type { PublicSiteSetting } from '@types'

import { PUBLIC_SITE_SETTINGS_SLUG } from '@root/globals/globalSlugs'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

import type { ResolvedPublicSiteSetting } from './resolvePublicSiteSetting.shared'

import { getPayload } from './getPayload'
import { resolvePublicSiteSettingFields } from './resolvePublicSiteSetting.shared'

export type { ResolvedPublicSiteSetting } from './resolvePublicSiteSetting.shared'
export {
  resolvePublicSiteSettingFields,
  resolvePublicSiteSettingFromEnvOnly,
} from './resolvePublicSiteSetting.shared'

let warnedGlobalFallback: boolean = false

function isLikelyMissingGlobalTableError(err: unknown): boolean {
  const parts: string[] = []
  let e: unknown = err
  for (let i = 0; i < 6 && e; i++) {
    if (e instanceof Error) {
      parts.push(e.message)
      e = e.cause
    } else {
      parts.push(String(e))
      break
    }
  }
  const blob = parts.join('\n').toLowerCase()
  return (
    blob.includes('no such table') ||
    blob.includes('does not exist') ||
    (blob.includes('sql') && blob.includes('public_site_settings'))
  )
}

const loadResolved = async (): Promise<ResolvedPublicSiteSetting> => {
  try {
    const payload = await getPayload()
    const doc = await payload.findGlobal({
      slug: PUBLIC_SITE_SETTINGS_SLUG,
      depth: 0,
    })
    const globalDoc: Partial<PublicSiteSetting> =
      doc && typeof doc === 'object' ? doc : {}

    return resolvePublicSiteSettingFields(globalDoc)
  } catch (err) {
    if (!isLikelyMissingGlobalTableError(err)) {
      throw err
    }
    if (!warnedGlobalFallback) {
      warnedGlobalFallback = true
      console.warn(
        '[resolvePublicSiteSetting] public-site-settings global unavailable; using NEXT_PUBLIC_* env only.',
      )
    }
    return resolvePublicSiteSettingFields({})
  }
}

const cachedResolved = unstable_cache(loadResolved, ['resolved-public-site-setting'], {
  tags: ['global-public-site-settings'],
})

/**
 * React `cache` dedupes layout + `generateMetadata` (same request). `unstable_cache`
 * dedupes across requests until `global-public-site-settings` is revalidated.
 */
export const resolvePublicSiteSetting = cache(async () => cachedResolved())
