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
      depth: CACHE_DEPTH.globalsShell,
      globals: ['main-menu', 'footer', 'topBar'],
      kind: 'marketing',
      locale,
      variant: 'globalsShell',
    },
    () => fetchGlobals(),
    () => fetchGlobals(),
  )
}
