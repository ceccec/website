/**
 * Client-safe exports (types + pure helpers). For {@link buildBasePlatformContext} /
 * {@link buildRequestPlatformContext}, import from `@root/platform/context.server`.
 */

export { getDefaultCurrencyCode, resolveCurrencyForRequest } from './currency'
export { getPlatformFeatureMatrix, type PlatformFeatureMatrix } from './features'
export type { CurrencyCode, DeploymentTarget, LocaleCode, RegionCode, TenantScope } from './types'
