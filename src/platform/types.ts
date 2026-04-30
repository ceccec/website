import type { DeploymentTarget } from '@root/plugins/payload-runtime/deploymentTarget'
import type { TypedLocale } from 'payload'

/**
 * Runtime plane: where the app is built and executed (storage, DB bindings, ISR/cache).
 * Orthogonal to tenant/locale/currency — same code paths, different adapters (OpenNext CF vs Vercel).
 */
export type { DeploymentTarget }

/** Resolved tenant scope when `@payloadcms/plugin-multi-tenant` is enabled and request is authenticated / routed. */
export type TenantScope =
  | {
      enabled: true
      id: number | string
      slug?: string
    }
  | { enabled: false }

/** ISO 4217 — commerce dimensions pair with {@link TenantScope} when ecommerce is on. */
export type CurrencyCode = string

/** Content + UI language — aligns Payload `localization` and next-intl. */
export type LocaleCode = TypedLocale | string

/** Optional regional/market slice (tax, shipping zones, catalog); extend per product. */
export type RegionCode = string
