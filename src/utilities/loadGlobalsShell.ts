import { CACHE_DEPTH, fetchGlobals } from '@data'
import { getRequestLocale, readDraftMode, runDraftLocaleCache } from '@utilities/marketingDataCache'

/**
 * Marketing shell globals: `getLocale` + `draftMode` + `unstable_cache` around
 * `fetchGlobals(locale)`. Cache key is UUID-backed via {@link runDraftLocaleCache}.
 */
export async function loadGlobalsShell() {
  const [draft, locale] = await Promise.all([readDraftMode(), getRequestLocale()])

  return runDraftLocaleCache(
    draft,
    locale,
    {
      kind: 'marketing',
      variant: 'globalsShell',
      depth: CACHE_DEPTH.globalsShell,
      globals: ['main-menu', 'footer', 'topBar'],
      locale,
    },
    () => fetchGlobals(),
    () => fetchGlobals(locale),
  )
}
