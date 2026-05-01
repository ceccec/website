# Platform architecture (`multi-*`)

This folder defines **orthogonal dimensions** so tenants, deployments, locales, and commerce do not entangle.

## Layers

| Dimension | Responsibility | Where it lives today |
|-----------|----------------|----------------------|
| **Deployment plane** | Same app, different runtime adapters (D1/R2 vs Postgres/Vercel Blob, OpenNext CF vs Node). | `getDeploymentTarget()` → `src/lib/deploymentTarget.ts`, `scripts/lib/deploymentTarget.mjs` |
| **Tenant isolation** | Row-level scope + access when SaaS / subsites are required. | Env `PAYLOAD_MULTI_TENANT` → `@payloadcms/plugin-multi-tenant`, `src/plugins/multi-tenant/` |
| **Locale** | Editorial language + UI strings. | Payload `localization` → `src/i18n/localization.ts`; UI → `next-intl` + `src/i18n/request.ts` |
| **Templates / slices** | Which collections/features ship in this deploy (marketing, docs, partners). | `src/plugins/env.ts` → `getPlatformFeatureMatrix()` |
| **Commerce / currency** | Catalog money + checkout — tenant or session defaults later. | Env `PAYLOAD_ECOMMERCE`; defaults → `DEFAULT_CURRENCY`, `resolveCurrencyForRequest()` |

## Composition rules

1. **Deployment ≠ tenant.** Workers vs Vercel is infrastructure; tenant is data isolation — compose both in access hooks / handlers when needed.
2. **Locale ≠ currency.** Translate UI with next-intl/Payload; charge in ISO 4217 per tenant/store policy.
3. **Feature matrix gates schema.** Optional plugins register collections only when env is on — migrations must cover the slices you deploy (`payload-deployment.mdc`).
4. **Request context grows incrementally.** Use `buildRequestPlatformContext()` from server code after you resolve `getLocale()`, cookies, or future `x-tenant-*` headers — do not read tenants inside `unstable_cache` callbacks without passing Ids in from outside.

## Env reference (extend alongside `src/plugins/env.ts`)

| Variable | Dimension |
|----------|-----------|
| `PAYLOAD_HOSTING` | Deployment plane hint (`vercel` / `cloudflare`) |
| `PAYLOAD_MULTI_TENANT` | Tenant plugin |
| `PAYLOAD_ECOMMERCE` | Commerce plugin |
| `DEFAULT_CURRENCY` | Fallback ISO 4217 when tenant/session has no preference |
| `NEXT_LOCALE` | Active UI/content locale (cookie; see middleware) |

## Marketing route cache (locale + draft)

Payload `find` wrappers used under `unstable_cache` must not call `getLocale` / `draftMode` inside the cache callback. Shared helpers live in **`src/utilities/marketingDataCache.ts`** (`cachedSlugDraftLocale`, `cachedLocaleList`, `cachedPageSegmentsDraftLocale`, …) alongside **`loadGlobalsShell`** for header/footer globals.

**Later batches:** `Feedback` (`fetchForm`), `RenderDocs` (`fetchRelatedThreads`), `getDocument` callers — apply the same pattern or thin wrappers.

## Next steps (when you scale each `multi-*`)

- **Tenant from host:** resolve subdomain → tenant id in `middleware.ts`, attach header or cookie; pass `tenant` into `buildRequestPlatformContext`.
- **Multi-region deploy:** pair `DeploymentTarget` with region-specific env vars or a small `deployments` map — keep Payload schema single-source.
- **Currency from Stripe/store:** replace `resolveCurrencyForRequest` body with tenant/document lookup when ecommerce is enabled.
