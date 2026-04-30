import type { CurrencyCode, TenantScope } from '@root/platform/types'

const DEFAULT = 'USD'

/**
 * Default catalog currency for the deployment. Override with `DEFAULT_CURRENCY` (ISO 4217).
 * When multi-tenant + ecommerce are on, prefer a `currency` (or similar) field on the
 * **tenant** or **store** document and pass it in from the request scope.
 */
export function getDefaultCurrencyCode(): CurrencyCode {
  return (process.env.DEFAULT_CURRENCY || DEFAULT).trim().toUpperCase() || DEFAULT
}

/**
 * Hook for per-tenant or per-session currency. Today: global default. Replace body when
 * tenant row or cart session supplies `preferredCurrency`.
 */
export function resolveCurrencyForRequest(_tenant: TenantScope | undefined): CurrencyCode {
  return getDefaultCurrencyCode()
}
