/**
 * Client-safe exports (types + pure helpers). For {@link buildBasePlatformContext} /
 * {@link buildRequestPlatformContext}, import from `@root/platform/context.server`.
 */

export type { DeploymentTarget, CurrencyCode, LocaleCode, RegionCode, TenantScope } from './types'
export { getPlatformFeatureMatrix, type PlatformFeatureMatrix } from './features'
export { getDefaultCurrencyCode, resolveCurrencyForRequest } from './currency'
