/**
 * Shared `unstable_cache` key for {@link fetchGlobals} in the marketing/docs shell layouts.
 * Keeps cache identity aligned across `(pages)/layout`, `not-found`, and docs route layouts.
 */

export const GLOBALS_SHELL_CACHE_KEY = ['globals', 'mainMenu', 'footer'] as const
