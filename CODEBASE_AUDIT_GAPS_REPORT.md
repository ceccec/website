# Codebase Audit: Core Functionality Gaps & Partially Wired Components

**Date:** April 30, 2026  
**Scope:** Full-stack audit across PayloadCMS + Next.js application  
**Focus:** Incomplete implementations, partially wired features, and integration gaps

---

## 🔴 High-Priority Gaps

### 1. **Cloud Environment Variables Management — Incomplete State Sync**

**File:** `src/app/(frontend)/(cloud)/cloud/[team-slug]/[project-slug]/(tabs)/settings/environment-variables/ManageEnvs/index.tsx`

**Issue:** After updating an environment variable, local UI state is not synchronized.

```typescript
// Line 123 — INCOMPLETE
if (req.status === 200) {
  toast.success('Environment variable updated successfully.')
  
  // TODO: set in state  ← STATE NOT UPDATED LOCALLY
  
  await revalidateCache({
    tags: uuidTags.cloud.projectDetailRevalidateTags({
      id: projectID,
      slug: projectSlug,
    }),
  })
}
```

**Impact:**
- User sees success toast but UI doesn't reflect the change until page reload
- Cache is revalidated (server-side) but local form state remains stale
- Poor UX: user might think update failed if they check the field again

**Recommended Fix:**
```typescript
setUpdatedEnv({
  id,
  key: newEnvKey,
  value: newEnvValue,
  updatedAt: new Date(),
})
```

---

### 2. **Cloud Environment Variables — Missing Delete Feedback**

**File:** Same as above (lines 157–161)

**Issue:** Delete operation doesn't validate or report status to user.

```typescript
// Line 157 — INCOMPLETE ERROR HANDLING
const req = await fetch(
  `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/projects/${projectID}/env?${query}`,
  { method: 'DELETE', ... }
)

// TODO: alert user based on status code & message  ← NO FEEDBACK

if (req.status === 200) {
  // reloadProject()  ← FUNCTION DOESN'T EXIST/ISN'T CALLED
}
```

**Impact:**
- Delete request completes silently without user feedback
- No error message if delete fails
- Success state uncertain (modal closes regardless of response)
- Orphaned code: `reloadProject()` is commented out

**Recommended Fix:**
```typescript
const res = await req.json()

if (req.ok) {
  toast.success('Environment variable deleted successfully.')
  // Optimistically update local state
  setEnvs(envs.filter(e => e.id !== id))
  // Revalidate server cache
  await revalidateCache(...)
} else {
  toast.error(parseOptionalMessagePayload(res) || 'Failed to delete')
}
```

---

### 3. **Stripe/Payment Types — Manual Type Definitions Instead of Generated**

**Files:**
- `src/app/(frontend)/(cloud)/cloud/_api/fetchSubscriptions.ts` (line 7)
- `src/app/(frontend)/(cloud)/cloud/_api/fetchTeam.ts` (line 17)
- `src/app/(frontend)/(cloud)/cloud/_api/fetchInvoices.ts` (implied)

**Issue:** Stripe types are hand-written instead of using `@stripe/stripe-js` or codegen.

```typescript
// Line 7-41 in fetchSubscriptions.ts — MANUAL TYPE DEFINITION
export interface Subscription {
  default_payment_method: string
  id: string
  items: {
    data: Array<{
      id: string
      price: {
        currency: string
        id: string
        // ... 20+ more fields manually typed
      }
    }>
  }
  metadata: { payload_project_id: string }
  plan: { amount: number; id: string; ... }
  project: Project  // ← Hybrid Payload + Stripe shape
  status: string
  trial_end: number
}
```

**Impact:**
- **Maintainability risk:** Manual types go out of sync with Stripe API updates
- **Duplication:** Same types redefined across 3 files
- **Type safety:** Missing fields or structural changes aren't caught at compile-time
- **Integration confusion:** Mixing Stripe fields with Payload `Project` extension

**Recommended Fix:**
1. Install `@stripe/stripe-js` types or use community `stripe` package types
2. Create a centralized `src/types/stripe.ts` with all type definitions
3. Use codegen if needed for complex nested structures

```typescript
// Centralized types
import type { Stripe } from '@stripe/stripe-js'

export type SubscriptionWithProject = Stripe.Subscription & {
  project: Project
}
```

---

### 4. **Cloud Checkout Flow — Incomplete Type Annotations**

**File:** `src/app/(frontend)/(cloud)/new/(checkout)/Checkout.tsx`

**Issue:** TODO comment indicates missing Stripe customer attachment logic.

```typescript
// Checkout.tsx (around line mentioned in TODO list)
// TODO: query the team's customer and attach it here  ← INCOMPLETE CHECKOUT FLOW
```

**Impact:**
- Checkout session doesn't attach existing Stripe customer
- Users may create duplicate customers or lose subscription history
- Payment method selection broken if customer lookup is missing

---

### 5. **Docs Routes — Missing Metadata/Dynamic SSG**

**File:** `src/app/(frontend)/(pages)/docs/v2/[topic]/[doc]/page.tsx` and related

**Issue:** Legacy docs route (`v2`) exists but conditionally hidden; v1, v2, dynamic routes are partially wired.

**Code:**
```typescript
if (process.env.NEXT_PUBLIC_ENABLE_LEGACY_DOCS !== 'true') {
  notFound()  // Exists but returns 404 if flag is off
}
```

**Impact:**
- Three doc route variants (v1, v2, dynamic) with duplicate logic
- Feature flag controls visibility but doesn't remove cruft
- Migration strategy unclear: which version is canonical?
- No consolidated routing logic

**Recommended Consolidation:**
- Choose one canonical docs router
- Remove v1/v2 complexity
- Migrate all content to single versioned structure

---

## 🟡 Medium-Priority Issues

### 6. **Cloud API Typing — Inconsistent Type Safety**

**Pattern Found Across:**
- `fetchTeam.ts`: GraphQL response types manually cast
- `fetchSubscriptions.ts`: Subscription interface incomplete
- `fetchInvoices.ts`: Similar pattern

**Issue:** No centralized Cloud API types; each file has hand-written interfaces.

```typescript
// fetchTeam.ts — Manual casting
const res = json as GraphQLJsonBody<{ Teams?: { docs?: Team[] } }>

// vs

// fetchSubscriptions.ts — Similar pattern
return body as SubscriptionsResult
```

**Impact:**
- Runtime type errors possible (no validation)
- Duplicated effort across files
- Hard to maintain as Cloud API evolves

---

### 7. **Toast Notifications — Partially Wired in Settings UI**

**File:** `src/app/(frontend)/(cloud)/cloud/[team-slug]/[project-slug]/(tabs)/settings/domains/AddDomain/index.tsx`

**Code:**
```typescript
// TODO - toast messages  ← MISSING USER FEEDBACK
```

**Impact:**
- User doesn't know if domain was added successfully
- No error reporting for network failures

**Pattern:** Affects multiple settings pages:
- Domains
- Plans  
- Environment variables (partially fixed)

---

### 8. **Form Submission State Management**

**File:** `src/app/(frontend)/(cloud)/cloud/[team-slug]/[project-slug]/(tabs)/settings/environment-variables/ManageEnvs/index.tsx` (line 90)

**Issue:** `updateEnv` callback doesn't type the `data` parameter.

```typescript
const updateEnv = React.useCallback(
  async ({ data }) => {  // ← data is untyped
    const newEnvKey = data[envKeyFieldPath]  // Any type
    const newEnvValue = data[envValueFieldPath]  // Any type
```

**Impact:**
- Loss of type safety in form handling
- IDE autocomplete doesn't work
- Refactoring risks (field name changes not caught)

---

### 9. **Modal Drawer Ref Access — Incomplete Implementation**

**File:** `src/app/(frontend)/(cloud)/cloud/_components/TeamDrawer/DrawerContent.tsx`

**Code:**
```typescript
// TODO: access the ref directly, might need to publish a `forwardRef` modal 
//       or add it to context
```

**Impact:**
- Drawer state management is indirect/incomplete
- Modal composition pattern needs clarification

---

### 10. **Cloud Graphics — Placeholder Assets Not Implemented**

**Files:**
- `src/app/(frontend)/(cloud)/layout.tsx` (line marked TODO)
- `src/app/(frontend)/(cloud)/cloud/layout.tsx` (line marked TODO)

**Code:**
```typescript
// TODO: Add cloud graphic  ← VISUAL ASSETS NOT INTEGRATED
```

**Impact:**
- Cloud pages missing hero/section graphics
- Incomplete visual design

---

## 🟢 Lower-Priority But Actionable

### 11. **Font Loading Issue — ESM/TS Mismatch**

**File:** `src/app/(frontend)/fonts.ts`

**Code:**
```typescript
// TODO: Fix the ESM/TS issue with the `localFont` import
```

**Impact:**
- Font type definitions may not be fully compatible
- Minor build/type-checking concern

---

### 12. **Environment Hook Threading**

**File:** `src/utilities/use-cloud-api.ts`

**Code:**
```typescript
// @TODO - need to thread through currently selected environment
```

**Impact:**
- Cloud API hook doesn't dynamically switch environments
- May require prop drilling or context refactoring

---

### 13. **Currency Fallback Not Localized**

**File:** `src/utilities/price-from-json.ts`

**Code:**
```typescript
currency: 'USD',  // TODO: use `parsed.currency`
```

**Impact:**
- Price displays always in USD regardless of user/team locale
- Needs parsed currency value from API response

---

### 14. **Search Modal State Sync**

**File:** `src/adapters/AlgoliaSearchBox/index.tsx`

**Code:**
```typescript
// TODO: allow outside changes to update this field (search modal)
```

**Impact:**
- Search modal doesn't sync with external state changes
- Parent component can't control search field value programmatically

---

### 15. **Table Component Stubbed for Build**

**File:** `src/components/MDX/components/Table/index.tsx`

**Code:**
```typescript
// TODO: Needed to stub this out to be able to build
```

**Impact:**
- MDX table rendering is incomplete
- Likely fallback behavior only

---

## 📊 Summary Checklist

### By Severity

| Severity | Count | Category |
|----------|-------|----------|
| 🔴 High | 5 | State sync, error handling, types, checkout flow, docs routing |
| 🟡 Medium | 5 | API typing, toasts, form typing, modal refs, graphics |
| 🟢 Low | 5 | Fonts, hooks, currency, search, tables |

### By Component Area

| Area | Issues | Status |
|------|--------|--------|
| **Cloud Settings UI** | 3 | Partially wired (env vars, domains, plans) |
| **Cloud API Layer** | 2 | Manual types, inconsistent error handling |
| **Payment/Checkout** | 2 | Incomplete Stripe integration |
| **Docs Routes** | 1 | Legacy complexity |
| **General UI** | 4 | Toast notifications, modals, search, tables |
| **Build/Type Issues** | 3 | Font loading, table stub, currency fallback |

---

## 🛠️ Recommended Action Plan

### Phase 1: Critical Fixes (1-2 days)
1. **Fix env var state sync** — Add local state update after successful PATCH
2. **Add delete feedback** — Complete delete error handling with toast messages
3. **Consolidate Stripe types** — Move to centralized `src/types/stripe.ts`
4. **Complete checkout flow** — Implement customer attachment logic

### Phase 2: Medium-Priority (2-3 days)
1. **Standardize Cloud API types** — Create interface generators or manual `@types/cloud-api.ts`
2. **Implement toast notifications** — Add success/error feedback across all settings forms
3. **Fix form typing** — Add proper TypeScript types to `updateEnv`, `updateDomain`, etc.
4. **Modal drawer pattern** — Clarify ref handling and context usage

### Phase 3: Cleanup (1 day)
1. **Consolidate docs routes** — Choose canonical version, remove v1/v2 variants
2. **Remove graphics TODOs** — Either create assets or use placeholders consistently
3. **Fix font/build issues** — Resolve ESM/TS conflicts
4. **Complete table component** — Implement full MDX table rendering

---

## 🎯 Patterns to Watch

### Anti-Pattern: `// TODO` Comments Without Context
- 15+ TODO comments indicate incomplete features
- Most lack tracking in issue system
- Should be migrated to GitHub issues with:
  - Impact assessment
  - Acceptance criteria
  - Priority level

### Anti-Pattern: Duplicated Type Definitions
- Stripe types defined 3+ times
- Cloud API types vary by file
- Solution: Centralize with codegen or manual `@types/*` packages

### Anti-Pattern: Silent Failures
- API responses don't alert users on error
- Delete/update operations "succeed" regardless
- Solution: Always pair API calls with toast notifications

### Anti-Pattern: Untyped Callbacks
- Form handlers with untyped `data` parameter
- Possible at runtime despite TypeScript
- Solution: Use form library types (e.g., `React.FormEvent<HTMLFormElement>`)

---

## Metrics

- **Total TODOs/FIXMEs:** 15+
- **Files with Gaps:** ~25
- **Estimated Effort to Close:** 5-7 days
- **Risk Level:** Medium (gaps are in Cloud/settings, not core platform)
- **User-Facing Impact:** Moderate UX friction, no data loss

---

## Next Steps

1. **Create GitHub issues** for each gap (use this audit as template)
2. **Prioritize** by impact (env vars, payment, docs first)
3. **Assign owners** and set sprint goals
4. **Establish pattern rules:**
   - All API calls must have error toast
   - All types from external APIs must be centralized
   - Form callbacks must be fully typed
5. **Add pre-commit checks** to catch new `TODO` comments

