/**
 * Shared `unstable_cache` key for {@link fetchGlobals} in the marketing/docs shell layouts.
 * Keeps cache identity aligned across `(pages)/layout`, `not-found`, and docs route layouts.
 */

import { CACHE_DEPTH } from '@data'

export const GLOBALS_SHELL_CACHE_KEY = [
  'globals',
  'shell',
  `depth-${CACHE_DEPTH.globalsShell}`,
  'mainMenu',
  'footer',
] as const
