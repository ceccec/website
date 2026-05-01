/**
 * Unified env + global field resolver.
 * Priority: explicit global value > first non-empty env value.
 * Admin overrides when non-empty; env fallback when global is empty/undefined.
 */

/**
 * Resolve string values: prefer global if set, fallback to env chain.
 * @param globalValue - Value from Payload global/doc (takes priority if non-empty string)
 * @param envValues - Environment variables to chain (first non-empty wins)
 */
export function resolveFirstEnvValue(
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

/**
 * Resolve boolean values: prefer explicit global, fallback to env parse.
 * @param globalValue - Boolean from Payload (undefined means defer to env)
 * @param envValue - Environment variable (parsed as 'true' string)
 */
export function resolveBooleanGlobalField(
  globalValue: boolean | null | undefined,
  envValue: string | undefined,
): boolean {
  if (globalValue === true) {
    return true
  }
  if (globalValue === false) {
    return false
  }
  return envValue === 'true'
}

/**
 * @deprecated Use resolveFirstEnvValue instead (same behavior).
 */
export function resolveGlobalField(globalValue: unknown, envValue: string | undefined): string {
  return resolveFirstEnvValue(globalValue, envValue)
}

/**
 * @deprecated Use resolveFirstEnvValue instead.
 */
export function resolveGlobalFieldChain(
  globalValue: unknown,
  ...envValues: (string | undefined)[]
): string {
  return resolveFirstEnvValue(globalValue, ...envValues)
}
