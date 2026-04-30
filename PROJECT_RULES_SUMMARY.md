# Project Rules Summary — PayloadCMS + Next.js Architecture

**Source:** `.cursor/rules/*.mdc` files  
**Principle:** Schema-first, type-safe, DRY, one source of truth  
**Scope:** This website (PayloadCMS + Next.js App Router)

---

## Core Rules (Non-Negotiable)

### Rule 1: Schema-First Architecture 🎯

**What it means:**
- **Payload collections, globals, and fields define the structure**
- React UI is **derivative** of the schema, not the source
- Change schema first → regenerate types → update UI

**When you violate it:**
- ❌ Hardcoding content in React components
- ❌ Ad-hoc JSON files for "content"
- ❌ Form structure defined in React instead of Payload

**When you follow it:**
- ✅ Editors manage content in Payload
- ✅ All queries use `getPayload()` Local API
- ✅ UI reflects CMS state, not vice versa

**Checklist:**
- [ ] All authorable content is in Payload (collections/globals)
- [ ] All validation rules are in Payload hooks, not React
- [ ] UI renders CMS data, not hardcoded values

---

### Rule 2: Type at the Edge (Validate Boundaries) 🔒

**What it means:**
- All external API responses start as `unknown`
- Validate/assert at the **boundary**, not throughout
- **Never use `any`** — narrow types explicitly

**When you violate it:**
- ❌ `const data: any = await response.json()`
- ❌ Assuming types without validation
- ❌ Stripe types defined 3 different ways

**When you follow it:**
- ✅ Response structure validated before use
- ✅ Types centralized in `@types/`
- ✅ IDE catches misuse at compile-time

**Example:**
```typescript
// ❌ WRONG
const subscription = await getSubscription() as Subscription

// ✅ RIGHT
const data: unknown = await response.json()
if (!isStripeSubscription(data)) throw new Error('Invalid response')
const subscription: StripeSubscription = data
```

**Checklist:**
- [ ] No `any` types (check: `grep -r " any" src/`)
- [ ] All API responses validated before use
- [ ] Type guards used for external APIs
- [ ] Stripe types in one place (`@types/stripe.ts`)

---

### Rule 3: Local API as Canonical Data Source 📡

**What it means:**
- **In Next.js**, use `getPayload()` in Server Components and Route Handlers
- Payload instance is cached; **don't add a second cache**
- Proper `depth` and `select` to avoid over-fetching

**When you violate it:**
- ❌ Using REST API in Server Component when Local API exists
- ❌ Adding module-level cache wrapper around `getPayload`
- ❌ Fetching `depth: 0` then hydrating in React

**When you follow it:**
- ✅ One code path for data (Local API)
- ✅ Payload handles caching + auth
- ✅ Proper depth matches UI needs

**Usage:**
```typescript
// In Server Component or Route Handler:
const payload = await getPayload()
const docs = await payload.find({
  collection: 'docs',
  depth: 2,  // ← Match UI needs
  select: { title: true, slug: true },  // ← Optimize
  where: { _status: { equals: 'published' } },
})
```

**Checklist:**
- [ ] `getPayload()` used in Server Components/Handlers
- [ ] No redundant caching around `getPayload`
- [ ] Depth/select parameters match UI needs
- [ ] No unneeded fields fetched

---

### Rule 4: One Source of Truth (No Duplication) 🎭

**What it means:**
- Business rules defined once; reused everywhere
- Validation in Payload hooks, not scattered
- Content in CMS, not hardcoded

**When you violate it:**
- ❌ Validation rules in Payload hook **and** React component
- ❌ Error handling inconsistent across forms
- ❌ Docs routes v1, v2, dynamic (3 implementations)
- ❌ Stripe types in 3 different files

**When you follow it:**
- ✅ One validation function, one place
- ✅ Consistent error handling across app
- ✅ Types centralized; easy to maintain

**Example:**
```typescript
// ❌ WRONG (validation in two places)
// Payload hook:
beforeChange({ data }) { if (!data.slug) throw new Error(...) }

// React:
const validate = (slug: string) => !slug ? "Required" : null

// ✅ RIGHT (one source)
// Payload hook (source of truth):
beforeChange({ data }) { if (!data.slug) throw new Error(...) }

// React (just renders):
<input error={errors.slug} />  // Payload did the validation
```

**Checklist:**
- [ ] Validation rules in Payload hooks, not React
- [ ] Error handling consistent (toast pattern everywhere)
- [ ] No duplicated types (centralize in `@types/`)
- [ ] State mutations sync with server

---

### Rule 5: Proper Caching & Revalidation ⚡

**What it means:**
- `unstable_cache` with semantic cache keys
- `revalidateTag` aligned with `uuidTags`
- Payload webhooks trigger invalidation

**When you violate it:**
- ❌ `unstable_cache` without `depth` in key
- ❌ Manual `revalidateTag` calls with hardcoded strings
- ❌ Missing tags on Payload mutation responses

**When you follow it:**
- ✅ Cache keys include everything affecting shape (depth, locale, draft)
- ✅ Tags match between `fetch` and `revalidateTag`
- ✅ Payload webhooks drive cache invalidation

**Usage:**
```typescript
// ✅ RIGHT: depth in cache key
const getCachedDocs = unstable_cache(
  () => payload.find({ collection: 'docs', depth: 2 }),
  ['docs', 'depth_2'],  // ← includes depth
  { tags: [uuidTags.localeList('docs')] }
)
```

**Checklist:**
- [ ] Cache keys include `depth`, `locale`, `draft`
- [ ] `revalidateTag` uses `uuidTags` constants
- [ ] Payload webhooks configured to revalidate
- [ ] No cache stampedes (CDN + ISR aligned)

---

### Rule 6: Server-Side Only for Sensitive Data 🔐

**What it means:**
- Secrets, auth tokens, admin queries → Server Components/Route Handlers only
- No accidental exposure in HTML/JavaScript sent to browser

**When you violate it:**
- ❌ Stripe secret key in `fetch` from client
- ❌ Admin-only Payload query in Browser component
- ❌ JWT or API tokens logged in browser console

**When you follow it:**
- ✅ Server Components handle auth checks
- ✅ Route Handlers validate before returning data
- ✅ No credentials leak in Network tab

**Checklist:**
- [ ] No secrets in client-side code
- [ ] Auth checks in Server Components, not React
- [ ] Admin queries use `overrideAccess` only server-side

---

### Rule 7: Payload Owns Business Rules, Next.js Owns Delivery 📦

**What it means:**
- **Payload:** Schema, access control, hooks, validation, versioning
- **Next.js:** Request lifecycle, caching, streaming, deployment

**When you violate it:**
- ❌ Access control checks in React
- ❌ Validation only in form component
- ❌ Caching strategy hardcoded in Route Handler

**When you follow it:**
- ✅ Payload hooks implement business logic
- ✅ Next.js caching layer optimizes delivery
- ✅ Both are replaceable independently

**Boundary:**
```
┌─────────────────────────────────────────┐
│ PAYLOAD (Business Logic)                │
│ • Collections & Fields (Schema)          │
│ • Hooks (Validation, Side Effects)       │
│ • Access Control Rules                   │
│ • Versions & Drafts                      │
│ • Admin UI & Workflows                   │
└─────────────────────────────────────────┘
           ↓ (Local API)
┌─────────────────────────────────────────┐
│ NEXT.JS (Request Delivery)              │
│ • Server Components & Route Handlers     │
│ • Caching & Revalidation                │
│ • Middleware & Headers                   │
│ • Streaming & ISR                        │
│ • Edge Functions                         │
└─────────────────────────────────────────┘
```

**Checklist:**
- [ ] Business rules in Payload hooks
- [ ] Caching strategy in Next.js layer
- [ ] Access control in Payload (not React)
- [ ] Both layers independent

---

## Key Patterns

### Pattern A: Safe Data Fetching

```typescript
// Server Component
async function getDocsForNav() {
  const payload = await getPayload()
  
  // 1. Query with proper depth
  const docs = await payload.find({
    collection: 'docs',
    depth: 1,  // ← Minimal depth for this use case
    select: { title: true, slug: true },  // ← Only needed fields
    where: { _status: { equals: 'published' } },
  })
  
  // 2. Data is trusted (from Payload Local API)
  return docs.map(doc => ({
    title: doc.title,  // ← Safe, typed
    slug: doc.slug,
  }))
}

// Use in JSX
export default function Layout({ children }) {
  const navItems = await getDocsForNav()
  return (
    <nav>
      {navItems.map(item => <a>{item.title}</a>)}  // ← Safe
    </nav>
  )
}
```

### Pattern B: Type-Safe API Responses

```typescript
// Define types in one place
export interface StripeSubscription {
  id: string
  status: string
  // ...
}

export function isStripeSubscription(data: unknown): data is StripeSubscription {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as any).id === 'string'
  )
}

// Use in handler
export async function GET() {
  const response = await fetch('https://api.stripe.com/...')
  const data: unknown = await response.json()
  
  if (!isStripeSubscription(data)) {
    return NextResponse.json({ error: 'Invalid response' }, { status: 500 })
  }
  
  // data is now safely typed
  return NextResponse.json({ subscriptionId: data.id })
}
```

### Pattern C: Consistent Error Handling

```typescript
// Reusable error handler
function parseApiError(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    return String((data as any).message)
  }
  return 'An error occurred'
}

// Use everywhere
async function handleSubmit(formData: FormData) {
  try {
    const response = await fetch('/api/...',{ body: JSON.stringify(formData) })
    const result: unknown = await response.json()
    
    if (!response.ok) {
      toast.error(parseApiError(result))
      return
    }
    
    toast.success('Saved!')
  } catch (error) {
    toast.error('Network error')
  }
}
```

### Pattern D: Cache-Aware Queries

```typescript
// Always include depth/locale/draft in cache key
import { payloadCacheKey, uuidTags } from '@uuid'

const getCachedDocs = unstable_cache(
  async (depth: number) =>
    (await getPayload()).find({
      collection: 'docs',
      depth,
      where: { _status: { equals: 'published' } },
    }),
  // Cache key must include depth!
  (depth) => ['docs', `depth_${depth}`],
  { tags: [uuidTags.localeList('docs')] }
)
```

---

## Enforcement Checklist

### Before Committing Code:

- [ ] **Schema first?** Changes to CMS schema come before UI changes
- [ ] **Types safe?** No `any`; boundaries validated
- [ ] **One source?** No duplicate business logic
- [ ] **Local API?** Server Components use `getPayload()`
- [ ] **Cached properly?** `depth` in cache key, tags aligned
- [ ] **Error feedback?** Toast for every API call
- [ ] **Centralized types?** No duplication in `@types/`
- [ ] **Server-safe?** No secrets in client code

### Pre-Deployment:

- [ ] `grep -r " any" src/` — zero results
- [ ] `grep -r "TODO\|FIXME" src/` — all tracked in issues
- [ ] Cache tags align with Payload webhooks
- [ ] All forms have error toasts
- [ ] No duplicate type definitions
- [ ] One canonical version per feature (no v1/v2)

---

## Violations & Fixes

| Violation | Manifestation | Fix |
|-----------|---|---|
| Hardcoded content | Copy in React file | Move to Payload collection |
| Scattered validation | Payload hook + React | Keep only in Payload hook |
| Duplicate types | Stripe types in 3 files | Centralize to `@types/stripe.ts` |
| No error feedback | Form submission silently fails | Add `toast.error()` |
| State desync | UI shows old value after update | Call `setLocal()` after server mutation |
| Unvalidated response | `const data = await fetch() as Type` | Use type guard: `if (!isType(data)) throw` |
| Hardcoded tags | `revalidateTag('docs')` | Use `uuidTags.localeList('docs')` |
| Missing depth | `await payload.find({ collection: 'docs' })` | Add `depth` matching UI needs |

---

## Quick Ref: File Organization

```
src/
├── types/               # Centralized type definitions
│   ├── stripe.ts       # Stripe API types
│   ├── forms.ts        # Form data types
│   └── cloud-api.ts    # Cloud API responses
│
├── app/
│   ├── _data/          # Server data fetching (Local API via getPayload)
│   ├── api/            # Route Handlers (proxies, webhooks, validation)
│   └── (frontend)/     # Server & Client Components
│
├── plugins/
│   ├── schema/         # Collections, globals, fields, blocks
│   ├── payload-runtime/# getPayload singleton
│   └── **/index.ts     # Exports (minimize re-exports)
│
├── utilities/          # Shared logic (cache keys, error parsing)
└── collections/        # Legacy (prefer src/plugins/schema)
```

---

## Resources

- **Payload Docs:** https://payloadcms.com/docs
- **PayloadCMS Concepts:** https://payloadcms.com/docs/getting-started/concepts
- **Local API:** https://payloadcms.com/docs/local-api/overview
- **Next.js Data Fetching:** https://nextjs.org/docs/app/getting-started/fetching-data
- **Next.js Caching:** https://nextjs.org/docs/app/getting-started/caching
- **TypeScript Best Practices:** https://payloadcms.com/docs/typescript/overview

---

## Summary

Follow these rules and your codebase will be:

1. **Schema-first** — Editors own content
2. **Type-safe** — No runtime surprises
3. **DRY** — Changes in one place
4. **Cacheable** — Optimized delivery
5. **Maintainable** — Clear boundaries
6. **Secure** — Secrets safe

**Key phrase:** "Payload defines, Next.js delivers."

