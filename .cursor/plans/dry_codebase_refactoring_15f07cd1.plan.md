---
name: DRY Codebase Refactoring
overview: Systematically eliminate DRY violations and dead code across the stack. Consolidate 19 Payload fetchers into a data-loader abstraction, unify environment resolution patterns, prune unused plugin re-exports and tenant cache wiring, and establish standardized cache/revalidation primitives for all data operations.
todos:
  - id: phase1-env
    content: "Phase 1: Consolidate env resolution (resolveGlobalField*, flatten site-settings barrel, cleanup platform context)"
    status: complete
  - id: phase2-plugins
    content: "Phase 2: Clean plugin re-exports (DeploymentTarget, payload-runtime constants, site-billing, multi-tenant, tenantHierarchy)"
    status: complete
  - id: phase3-loader
    content: "Phase 3: Create dataLoader abstraction and migrate 19 fetchers from src/app/_data to use builder pattern"
    status: in-progress
  - id: phase4-cache
    content: "Phase 4: Extend cache tags, consolidate marketingDataCache/tenantDataCache, fix loadGlobalsShell tags"
    status: pending
  - id: phase5-dead
    content: "Phase 5: Remove dead code (stubs, unused exports, orphaned functions)"
    status: complete
  - id: phase6-exports
    content: "Phase 6: Finalize export surface and document stable APIs"
    status: in-progress
  - id: audit-gaps
    content: "Audit: Deep codebase scan for functionality gaps and partially wired components"
    status: complete
  - id: rules-implementation
    content: "Implementation: Fill gaps using PayloadCMS + Next.js architectural rules"
    status: complete
isProject: false
---

# DRY Codebase Refactoring — Breaking Changes, Full Stack

## Phase 1: Environment & Secrets Resolution (Foundation)

**Goal:** Single source of truth for all env var fallback patterns.

### 1.1 Consolidate `resolveGlobalField*` utilities

- **File:** [`src/plugins/site-settings/resolveGlobalField.ts`](src/plugins/site-settings/resolveGlobalField.ts)
- **Current state:** Three separate functions (`resolveGlobalField`, `resolveGlobalFieldChain`, `resolveFirstEnvValue`, `resolveBooleanGlobalField`).
- **Action:** Keep only **`resolveFirstEnvValue`** (generic env chain resolver); inline other variants into their callers or consolidate into single overloaded fn.
- **Impact:** [`resolveIntegrationSecrets.ts`](src/plugins/site-settings/resolveIntegrationSecrets.ts), [`authorizeSyncApi.ts`](src/utilities/authorizeSyncApi.ts), [`jobsAccess.ts`](src/config/jobsAccess.ts) all import from here—update imports.

### 1.2 Flatten `site-settings` barrel

- **File:** [`src/plugins/site-settings/index.ts`](src/plugins/site-settings/index.ts)
- **Action:** Remove barrel; callers already use deep imports (e.g., `@root/plugins/site-settings/resolveGlobalField`). Delete the `index.ts`.
- **Impact:** Search for `@root/plugins/site-settings` (not subpath) imports; there should be none. If found, migrate to subpaths.

### 1.3 Consolidate `platform` context & types

- **Files:** [`src/platform/types.ts`](src/platform/types.ts), [`src/platform/context.server.ts`](src/platform/context.server.ts), [`src/platform/index.ts`](src/platform/index.ts)
- **Current state:** `buildRequestPlatformContext` and `buildBasePlatformContext` are **unused**; `RegionCode` is defined but never referenced.
- **Action:** Delete `context.server.ts` if truly unused; move core types (`DeploymentTarget`, `CurrencyCode`, `LocaleCode`, `TenantScope`) directly into `types.ts`; flatten `platform/index.ts` to export only active types.
- **Verify:** Grep for imports of these functions/types; if zero, delete.

---

## Phase 2: Plugin Architecture Cleanup

**Goal:** Eliminate redundant re-exports and unused wiring.

### 2.1 Consolidate `DeploymentTarget` export surface

- **Current:** Defined in [`src/plugins/payload-runtime/deploymentTarget.ts`](src/plugins/payload-runtime/deploymentTarget.ts), re-exported via `payload-runtime/index.ts` and `plugins/index.ts`.
- **Action:** 
  - Remove re-export from `plugins/index.ts` (keep only in `payload-runtime`).
  - Update any imports of `@root/plugins DeploymentTarget` → `@root/plugins/payload-runtime`.
- **Files affected:** Check all imports; likely only `src/plugins/index.ts` itself and `payload.config.ts`.

### 2.2 Remove `payload-runtime` barrel for unused route constants

- **File:** [`src/plugins/payload-runtime/index.ts`](src/plugins/payload-runtime/index.ts)
- **Current exports:** `PAYLOAD_GRAPHQL_PATH`, `PAYLOAD_REST_API_PREFIX` are **not imported** anywhere in `src/`.
- **Action:** Delete these exports from the barrel (keep them in `payloadRoutes.ts` if Payload uses them internally, but don't re-export).
- **Verify:** Grep for imports of these constants; if zero, remove.

### 2.3 Eliminate dead tenant cache wiring

- **File:** [`src/plugins/multi-tenant/index.ts`](src/plugins/multi-tenant/index.ts)
- **Current state:** Re-exports `cachedWithTenantScope`, `getTenantContentScopeIdsForRequest`, `tenantWhereFromIds` from `tenantDataCache.ts`. 
- **Check:** Are any of these imported from the barrel (`@root/plugins/multi-tenant`)? Or do callers use the `tenantDataCache` module directly?
- **Action:** If **no external callers use the barrel exports**, remove them from the barrel. Keep `tenantHierarchy` utilities since they are used internally.
- **Verify:** Grep for `from '@root/plugins/multi-tenant'` (not subpath). If zero or only internal, remove.

### 2.4 Prune unused `site-billing` exports

- **File:** [`src/plugins/site-billing/index.ts`](src/plugins/site-billing/index.ts)
- **Current state:** `isStripeMarketingConfigured`, `resolveMarketingCheckoutProvider`, and `MarketingCheckout*` types are re-exported but **only used inside** the module or tests.
- **Action:** Remove these exports from the barrel. Keep `createMarketingCheckout` and `createMarketingBillingSession` (those are consumed).
- **Verify:** Grep for imports of these symbols from the barrel; if zero, remove.

### 2.5 Simplify `payload-runtime/index.ts` barrel

- **Consolidate:** Remove `assertCloudflarePayloadBindings`, `resolvePayloadDB`, `nodeRequire`, `PAYLOAD_SQL_ID_TYPE` from the barrel export list.
- **Rationale:** Callers import from subpaths (e.g., `@root/plugins/payload-runtime/getPayload`), not the barrel.
- **Keep:** Only export `getPayload` (the main entry point) and `DeploymentTarget` (via re-export for type-checking).
- **Verify:** Check all barrel imports; migrate any found to subpaths.

---

## Phase 3: Data Fetching Abstraction (Core Refactor)

**Goal:** Consolidate 19 Payload fetchers into a type-safe data-loader pattern.

### 3.1 Create `src/utilities/dataLoader.ts`

**Purpose:** Unified factory for all Payload collection queries (replaces individual fetchers in `src/app/_data/index.ts`).

**Signature & pattern:**

```typescript
/**
 * Type-safe data loader factory. Consolidates:
 * - Locale resolution (fallback to request context)
 * - Draft mode resolution (fallback to draftMode())
 * - Payload instance retrieval
 * - Where-clause standardization (published filter, custom conditions)
 * - Cache key generation (via payloadCacheKey + uuidTags)
 * 
 * Usage: 
 *   const page = await loader()
 *     .collection('pages')
 *     .slug('home')
 *     .where({ slug: { equals: 'home' }, ...publishedUnlessDraft(draft) })
 *     .depth(CACHE_DEPTH.page)
 *     .findOne()
 * 
 *   const items = await loader()
 *     .collection('posts')
 *     .where({ _status: { equals: 'published' } })
 *     .select(['slug', 'title'])
 *     .find()
 */
export function createDataLoader(
  context?: DataLoaderContext
): DataLoaderBuilder
```

**Components:**
- **`DataLoaderContext`**: Captures `locale`, `draft`, `depth` defaults; built from request if not provided.
- **`DataLoaderBuilder`**: Fluent chain API with `.collection()`, `.where()`, `.depth()`, `.select()`, `.limit()`, `.sort()`, `.findOne()` / `.find()`.
- **Internal:** Each builder call composes `payloadCacheKey`, applies `uuidTags` automatically, wraps in `unstable_cache` if needed.

### 3.2 Refactor `src/app/_data/index.ts` to use the loader

- **Before:** 19 individual async functions with repeated `locale + getPayload + find + where.and + publishedUnlessDraft`.
- **After:** Each function becomes a thin wrapper calling the loader.

**Example migration:**

```typescript
// OLD
export const fetchPage = async (slugSegments, options?) => {
  const draft = options?.draft !== undefined ? options.draft : (await draftMode()).isEnabled
  const locale = options?.locale ?? (await resolvePayloadLocale())
  const payload = await getPayload()
  const slug = slugSegments.at(-1)
  const data = await payload.find({
    collection: 'pages',
    depth: CACHE_DEPTH.page,
    draft,
    limit: 1,
    locale,
    where: { and: [{ slug: { equals: slug } }, ...publishedUnlessDraft(draft)] }
  })
  return data.docs[0] ?? null
}

// NEW
export const fetchPage = async (slugSegments, options?) => {
  const loader = createDataLoader({ draft: options?.draft, locale: options?.locale })
  return loader
    .collection('pages')
    .slug(slugSegments.at(-1))
    .depth(CACHE_DEPTH.page)
    .findOne()
}
```

### 3.3 Unify `useCloudAPI` pattern with server-side fetchers

- **Goal:** Standardize Cloud CMS REST fetching (client-side) with Payload Local API patterns (server-side).
- **File:** [`src/utilities/use-cloud-api.ts`](src/utilities/use-cloud-api.ts)
- **Action:** Extract error parsing and JSON handling into a shared **`parseApiResponse(req, json)`** utility; use it in both client hooks and server Route Handlers.
- **Impact:** Reduces duplication in error messages and response validation.

---

## Phase 4: Cache & Revalidation Standardization

**Goal:** Unified caching strategy across all data operations.

### 4.1 Extend `uuid.ts` cache tags for new loader patterns

- **File:** [`src/utilities/uuid.ts`](src/utilities/uuid.ts)
- **Add:** Helpers to generate cache tags dynamically for any collection/filter combo (currently only slug/id are built in).
- **Example:**
  ```typescript
  export function collectionTag(collection: string): string
  export function collectionWhereTag(collection: string, whereKey: string): string
  export function loaderTag(collection: string, shape: Record<string, unknown>): string
  ```
- **Impact:** Enable `dataLoader` to auto-tag cache entries without hardcoding per-collection logic.

### 4.2 Consolidate `marketingDataCache.ts` + `tenantDataCache.ts` into single abstraction

- **Goal:** Both wrap `unstable_cache` + `payloadCacheKey` + tags for different scopes (locale/draft vs tenant).
- **Action:** 
  - Keep both files for domain clarity (marketing concerns vs multi-tenant concerns).
  - Extract shared **`CachedQueryOptions`** type and error handling.
  - Document in each: "Use `dataLoader` for most new queries; this layer for request-context scoped caching."

### 4.3 Fix missing cache tags on `loadGlobalsShell`

- **File:** [`src/utilities/loadGlobalsShell.ts`](src/utilities/loadGlobalsShell.ts)
- **Current:** Calls `runDraftLocaleCache` with no `tags` option → revalidation on globals does nothing.
- **Action:** Pass explicit tags (e.g., `[uuidTags.tenantsPublicSite, uuidTags.footer, uuidTags.mainMenu, uuidTags.topBar]`) so globals bust on publish.

---

## Phase 5: Dead Code Removal

**Goal:** Remove scaffolding and unused implementations.

### 5.1 Delete template stubs if no longer used

- **File:** [`src/app/_data/payloadTemplateStubs.ts`](src/app/_data/payloadTemplateStubs.ts)
- **Current:** `emptyMarketingLayoutGlobals()`, `emptyGetStartedGlobal()` return zero-UUID stub objects when marketing is off.
- **Check:** Are these actually returned from `fetchGlobals()`, `fetchGetStarted()` when the feature flags are false? If yes, keep. If no, delete.
- **Action:** Grep for calls to `emptyMarketingLayoutGlobals` and `emptyGetStartedGlobal`. If unused, delete the file.

### 5.2 Audit & remove `tenantHierarchy.ts` unused exports

- **File:** [`src/plugins/multi-tenant/tenantHierarchy.ts`](src/plugins/multi-tenant/tenantHierarchy.ts)
- **Unused exports (from earlier analysis):** `listAncestorTenantIds`, `listDescendantTenantIds`, `listTenantIdsForHostDomainChain`, etc.
- **Action:** Delete if no imports found anywhere in `src/`. Keep only **`resolveContentTenantIdsForHost`**, **`whereTenantIn`**, and any actually used helpers.

### 5.3 Remove unused `commaEnv` if no callers

- **File:** [`src/plugins/site-settings/commaEnv.ts`](src/plugins/site-settings/commaEnv.ts)
- **Action:** Grep for `commaSeparatedEnv` imports. If zero, delete the file and its re-export from the old barrel.

---

## Phase 6: Type Safety & Exports Consistency

**Goal:** Establish stable, intentional export surface.

### 6.1 Consolidate type exports

- **Rule:** Types live next to implementations; re-export from `index.ts` only if the module is a public package (not an internal utility layer).
- **Apply to:** `site-settings`, `payload-runtime`, `multi-tenant`, `ecommerce`, `stripe`, `revolut`.
- **Action:** For each, decide: **public package** (keep barrel) or **internal layer** (remove barrel, use deep imports). Most should be **internal**.

### 6.2 Document stable vs unstable APIs

- **File:** Create `src/ARCHITECTURE.md` (if not present) or update existing docs.
- **Sections:**
  - **Public APIs:** `@root/plugins/payload-runtime/getPayload`, `@root/platform`, `@root/utilities/dataLoader` (new).
  - **Internal utilities:** `@root/plugins/site-settings/*`, `@root/utilities/uuid`, etc. (deep import only).
  - **Collections / Globals:** Payload schema surface (stable).

---

## Phase 7: Optional Refinements (If Time)

### 7.1 Migrate TODO items to a tracking system

- **File:** Audit the ~10 TODO comments in the codebase (Stripe types, cloud graphics, toast UX, etc.).
- **Action:** Create GitHub issues for each; remove inline TODOs or replace with issue links.

### 7.2 Align `dateToISO` / date utilities

- **Check:** Are there duplicate date formatting or published-date filtering patterns? Consolidate into `src/utilities/dateUtils.ts` if scattered.

### 7.3 Test coverage for data loader

- **Goal:** Ensure new abstraction doesn't break existing pages.
- **Scope:** Write tests for `dataLoader().collection('pages').findOne()` vs legacy `fetchPage()` parity.

---

## Implementation Order

1. **Phase 1** (env resolution) — Foundation, no breaking changes until all imports updated.
2. **Phase 2** (plugin cleanup) — Delete unused exports; update imports.
3. **Phase 4.1** (cache tags) — Add new tag helpers to `uuid.ts`.
4. **Phase 3** (data loader) — Implement, then migrate all `_data` fetchers.
5. **Phase 5** (dead code) — Remove stubs and unused exports.
6. **Phase 6** (exports) — Document and finalize API surface.

**Estimated scope:** 40–50 file changes, most mechanical. 2–3 days for thorough implementation + testing.