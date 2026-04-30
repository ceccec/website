/**
 * Form Data Types — centralized types for all settings forms
 *
 * Single source of truth for form data structures used across Cloud settings pages.
 * Prevents `any` types in form handlers and enables IdE autocomplete.
 *
 * Update when adding new settings forms; referenced by:
 * - src/app/(frontend)/(cloud)/cloud/[team-slug]/[project-slug]/(tabs)/settings/environment-variables/
 * - src/app/(frontend)/(cloud)/cloud/[team-slug]/[project-slug]/(tabs)/settings/domains/
 */

/** Environment variable form (update existing variable) */
export interface EnvironmentVariableFormData {
  envKey: string
  envValue: string
}

/** Environment variable array item (for bulk add) */
export interface EnvironmentVariableItem {
  key: string
  value: string
}

/** Add multiple environment variables form */
export interface AddEnvironmentVariablesFormData {
  newEnvs: EnvironmentVariableItem[]
}

/** Add domain form */
export interface AddDomainFormData {
  newDomain: string
}

/** Domain configuration structure */
export interface DomainConfig {
  cloudflareId?: string
  domain: string
  id?: string
  recordContent?: string
  recordName?: string
  recordType?: string
}

/** Type guard: validate environment variable form data */
export function isEnvironmentVariableFormData(
  data: unknown,
): data is EnvironmentVariableFormData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'envKey' in data &&
    'envValue' in data &&
    typeof (data as any).envKey === 'string' &&
    typeof (data as any).envValue === 'string'
  )
}

/** Type guard: validate environment variable items */
export function isEnvironmentVariableItem(data: unknown): data is EnvironmentVariableItem {
  return (
    typeof data === 'object' &&
    data !== null &&
    'key' in data &&
    'value' in data &&
    typeof (data as any).key === 'string' &&
    typeof (data as any).value === 'string'
  )
}

/** Type guard: validate add environment variables form data */
export function isAddEnvironmentVariablesFormData(
  data: unknown,
): data is AddEnvironmentVariablesFormData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'newEnvs' in data &&
    Array.isArray((data as any).newEnvs) &&
    (data as any).newEnvs.every(isEnvironmentVariableItem)
  )
}

/** Type guard: validate add domain form data */
export function isAddDomainFormData(data: unknown): data is AddDomainFormData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'newDomain' in data &&
    typeof (data as any).newDomain === 'string'
  )
}

/** Type guard: validate domain config */
export function isDomainConfig(data: unknown): data is DomainConfig {
  return (
    typeof data === 'object' &&
    data !== null &&
    'domain' in data &&
    typeof (data as any).domain === 'string'
  )
}
