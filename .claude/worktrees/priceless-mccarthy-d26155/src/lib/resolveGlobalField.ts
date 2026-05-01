/**
 * Resolve Payload global field values with `process.env` fallbacks (Admin overrides when non-empty).
 * Used by `resolvePublicSiteSetting`, `resolveIntegrationSecrets`, and client components.
 */

/** Non-secret string: global wins when non-empty after trim. */
export function resolveGlobalField(globalValue: unknown, envValue: string | undefined): string {
  if (typeof globalValue === 'string' && globalValue.trim()) {
    return globalValue.trim()
  }
  return envValue?.trim() ?? ''
}

/** Global field plus multiple env fallbacks (first non-empty env wins after global). */
export function resolveGlobalFieldChain(
  globalValue: unknown,
  ...envValues: (string | undefined)[]
): string {
  if (typeof globalValue === 'string' && globalValue.trim()) {
    return globalValue.trim()
  }
  for (const candidate of envValues) {
    const trimmed = candidate?.trim()
    if (trimmed) {
      return trimmed
    }
  }
  return ''
}

/** Env-only chain (e.g. cron: `CRON_SECRET` then `NEXT_PRIVATE_CRON_KEY`). */
export function resolveFirstEnvValue(...envValues: (string | undefined)[]): string {
  return resolveGlobalFieldChain(undefined, ...envValues)
}

/** Boolean global field, else env string `=== 'true'`. */
export function resolveBooleanGlobalField(
  field: boolean | null | undefined,
  envValue: string | undefined,
): boolean {
  if (field === true) {
    return true
  }
  if (field === false) {
    return false
  }
  return envValue === 'true'
}
