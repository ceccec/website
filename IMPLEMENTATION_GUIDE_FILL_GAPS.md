# Implementation Guide: Fill Gaps by Rules

**Core Principle:** Schema-first, type-safe, centralized data access, one source of truth.

---

## Rule Analysis: What the Project Rules Demand

### 1. **Schema-First Architecture**
- **Payload** owns schema, access, hooks, validation
- **Next.js** owns request lifecycle, caching, deployment
- **Never hardcode content** in React; always query CMS

### 2. **Type at the Edge** (Validate Boundaries)
- All external API responses are `unknown` until validated
- Stripe types, Cloud API types must be asserted/validated
- `any` is forbidden; narrow types explicitly

### 3. **Local API as Canonical Data Source**
- `getPayload()` in Server Components and Route Handlers
- Payload instance is cached; don't add second cache
- Proper `depth` and `select` to avoid over-fetching

### 4. **One Source of Truth**
- Validation rules live in Payload hooks, not scattered
- Error handling must be consistent
- State updates must sync with server truth

### 5. **Proper Cache & Revalidation**
- `unstable_cache` with semantic cache keys
- `revalidateTag` aligned with `uuidTags`
- Payload webhooks trigger invalidation

---

## Gap-by-Gap Implementation

### **GAP 1: Environment Variables State Desync**

**File:** `src/app/(frontend)/(cloud)/cloud/[team-slug]/[project-slug]/(tabs)/settings/environment-variables/ManageEnvs/index.tsx`

**Rule Violation:**
- ❌ Server mutation happens, but local state doesn't sync
- ❌ User sees success but value unchanged
- ❌ No single source of truth

**Fix (Apply Schema-First + Type-Safe Principles):**

```typescript
'use client'

import React, { useCallback, useState } from 'react'
import type { Project } from '@root/payload-cloud-types'
import { toast } from 'sonner'

type EnvironmentVariable = {
  id?: string
  key?: string
  value?: string
}

type Props = {
  env: EnvironmentVariable
  envs: Project['environmentVariables']
  projectId: Project['id']
  projectSlug?: Project['slug']
  environmentSlug?: string
  // ✅ Callback to update parent state
  onEnvUpdated?: (updated: EnvironmentVariable) => void
}

export const ManageEnv: React.FC<Props> = ({
  env: { id, key },
  envs,
  projectId,
  projectSlug,
  environmentSlug,
  onEnvUpdated,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [fetchedEnvValue, setFetchedEnvValue] = useState<string | undefined>(undefined)

  const updateEnv = useCallback(
    async (data: Record<string, unknown>) => {
      const newEnvKey = String(data.envKey ?? '')
      const newEnvValue = String(data.envValue ?? '')

      if (!newEnvKey || !newEnvValue || !id) return

      setIsLoading(true)
      try {
        const query = new URLSearchParams({
          env: environmentSlug ?? '',
        })

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/projects/${projectId}/env?${query}`,
          {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ arrayId: id, key: newEnvKey, value: newEnvValue }),
          },
        )

        // ✅ TYPE AT EDGE: Validate response structure
        const result: unknown = await response.json()
        
        if (!response.ok) {
          const errorMsg = 
            typeof result === 'object' && result !== null && 'message' in result
              ? String((result as { message: unknown }).message)
              : 'Failed to update environment variable'
          
          toast.error(errorMsg)
          return
        }

        // ✅ SINGLE SOURCE OF TRUTH: Update local state and notify parent
        const updatedEnv: EnvironmentVariable = { id, key: newEnvKey, value: newEnvValue }
        setFetchedEnvValue(newEnvValue)
        onEnvUpdated?.(updatedEnv)
        
        toast.success('Environment variable updated successfully.')
      } catch (error) {
        console.error('Failed to update env var:', error)
        toast.error('Network error. Please try again.')
      } finally {
        setIsLoading(false)
      }
    },
    [id, environmentSlug, projectId, onEnvUpdated],
  )

  // ... rest of component
}
```

**Parent Component Update (ManageEnvs):**

```typescript
export const ManageEnvs: React.FC<Props> = (props) => {
  const { envs: initialEnvs, ...rest } = props
  const [envs, setEnvs] = useState(initialEnvs)

  const handleEnvUpdated = (updated: EnvironmentVariable) => {
    setEnvs(prev =>
      prev.map(e => (e.id === updated.id ? { ...e, ...updated } : e))
    )
  }

  return (
    <CollapsibleGroup allowMultiple transCurve="ease" transTime={250}>
      <div className={classes.envs}>
        {envs?.map((env) => (
          <ManageEnv
            key={env.id}
            env={env}
            envs={envs}
            onEnvUpdated={handleEnvUpdated}
            {...rest}
          />
        ))}
      </div>
    </CollapsibleGroup>
  )
}
```

---

### **GAP 2: Missing Delete Error Handling & Feedback**

**File:** Same as above (lines 140–167)

**Rule Violation:**
- ❌ No error feedback to user
- ❌ No validation of response
- ❌ Orphaned function call (`reloadProject()`)

**Fix (Apply Type-Safe + Proper Error Handling):**

```typescript
const deleteEnv = useCallback(async () => {
  if (!id) return

  setIsLoading(true)
  try {
    const query = new URLSearchParams({
      env: environmentSlug ?? '',
      key: key ?? '',
    })

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/projects/${projectId}/env?${query}`,
      {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    // ✅ TYPE AT EDGE: Validate response
    const result: unknown = await response.json()

    if (!response.ok) {
      const errorMsg =
        typeof result === 'object' && result !== null && 'message' in result
          ? String((result as { message: unknown }).message)
          : 'Failed to delete environment variable'
      
      toast.error(errorMsg)
      return
    }

    // ✅ SUCCESS: Notify parent to remove from list
    toast.success('Environment variable deleted successfully.')
    onEnvDeleted?.(id)
  } catch (error) {
    console.error('Delete failed:', error)
    toast.error('Network error. Please try again.')
  } finally {
    closeModal(modalSlug)
    setIsLoading(false)
  }
}, [environmentSlug, key, projectId, id, closeModal, modalSlug, onEnvDeleted])
```

---

### **GAP 3: Duplicated & Manually Typed Stripe Interfaces**

**Files:**
- `src/app/(frontend)/(cloud)/cloud/_api/fetchSubscriptions.ts`
- `src/app/(frontend)/(cloud)/cloud/_api/fetchTeam.ts`
- `src/app/(frontend)/(cloud)/cloud/_api/fetchInvoices.ts`

**Rule Violation:**
- ❌ Type definitions scattered across 3 files
- ❌ Manual typing means sync risk with Stripe API
- ❌ Hybrid shapes (Stripe + Payload) create confusion

**Fix (Centralize Types):**

**Create:** `src/types/stripe.ts`

```typescript
/**
 * Stripe types — centralized from Stripe API with Payload extensions.
 * Source: @stripe/stripe-js (when available), else manual with TODO to migrate.
 * 
 * These match Stripe API shapes + project-specific extensions.
 */

/** Stripe Subscription with project reference (Payload extension). */
export interface StripeSubscription {
  default_payment_method: string
  id: string
  items: {
    data: Array<{
      id: string
      price: {
        currency: string
        id: string
        nickname: string
        product: string
        recurring: {
          interval: string
          interval_count: number
        }
        type: string
        unit_amount: number
      }
    }>
  }
  metadata: {
    payload_project_id: string
  }
  plan: {
    amount: number
    id: string
    nickname: string
  }
  project: Project  // Payload extension
  status: string
  trial_end: number
}

export interface StripeSubscriptionsResult {
  data: StripeSubscription[]
  has_more: boolean
}

/** Stripe Customer with Payload extensions. */
export interface StripeCustomer {
  deleted?: boolean
  id?: string
  invoice_settings?: {
    default_payment_method?:
      | {
          id?: string
        }
      | string
  }
}

/** Invoice item structure from Stripe API. */
export interface StripeInvoiceItem {
  id: string
  amount: number
  currency: string
  description?: string
  invoice?: string
  subscription?: string
}

/** Stripe Invoice with line items. */
export interface StripeInvoice {
  id: string
  created: number
  customer: string
  amount_due: number
  amount_paid: number
  amount_remaining: number
  currency: string
  lines: {
    data: StripeInvoiceItem[]
  }
  payment_intent: string | null
  paid: boolean
  pdf: string
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
}

/** Type guard for Stripe responses — validates at API boundary. */
export function isStripeSubscription(data: unknown): data is StripeSubscription {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'items' in data &&
    'status' in data &&
    Array.isArray((data as any).items?.data)
  )
}

export function isStripeCustomer(data: unknown): data is StripeCustomer {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('id' in data || 'deleted' in data)
  )
}
```

**Update:** `src/app/(frontend)/(cloud)/cloud/_api/fetchSubscriptions.ts`

```typescript
import type { Project, Team } from '@root/payload-cloud-types'
import type { StripeSubscription, StripeSubscriptionsResult } from '@root/types/stripe'
import { isStripeSubscription } from '@root/types/stripe'
import { fetchNextTags, uuidTags } from '@uuid'
import { payloadCloudToken } from './token'

export const fetchSubscriptions = async (team?: string | Team): Promise<StripeSubscriptionsResult> => {
  const teamId = typeof team === 'string' ? team : team?.id
  if (!teamId) throw new Error('No team Id provided')

  const { cookies } = await import('next/headers')
  const token = (await cookies()).get(payloadCloudToken)?.value ?? null
  if (!token) throw new Error('No token provided')

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/teams/${teamId}/subscriptions`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      method: 'POST',
      ...fetchNextTags(
        ...uuidTags.cloud.teamBillingScope({
          id: teamId,
          slug: typeof team === 'object' && team !== null && 'slug' in team ? team.slug : undefined,
        }),
      ),
    },
  ).then((r) => r.json())

  // ✅ TYPE AT EDGE: Validate response structure
  const body: unknown = response
  if (
    typeof body === 'object' &&
    body !== null &&
    'data' in body &&
    Array.isArray((body as any).data)
  ) {
    return body as StripeSubscriptionsResult
  }

  throw new Error('Invalid subscription response from Cloud API')
}
```

---

### **GAP 4: Incomplete Checkout Flow (Missing Customer Attachment)**

**File:** `src/app/(frontend)/(cloud)/new/(checkout)/Checkout.tsx`

**Rule Violation:**
- ❌ Stripe customer not attached to checkout session
- ❌ Users may duplicate customers or lose history
- ❌ TODO comment indicates incomplete feature

**Fix (Add Customer Resolution):**

```typescript
// src/app/(frontend)/(cloud)/new/(checkout)/Checkout.tsx (Server Component)

import { fetchTeamWithCustomer } from '@root/app/(frontend)/(cloud)/cloud/_api/fetchTeam'
import { createMarketingCheckout } from '@root/plugins/site-billing/marketingCheckout'
import { getPayload } from '@root/plugins/payload-runtime/getPayload'

export async function CheckoutPage({ params: { teamSlug } }: CheckoutPageProps) {
  // ✅ SCHEMA-FIRST: Query Payload for user, then Cloud for customer
  const payload = await getPayload()
  const user = await payload.auth({ headers: {} })

  if (!user?.id) {
    return notFound()
  }

  // ✅ Get team with Stripe customer info from Cloud
  const teamWithCustomer = await fetchTeamWithCustomer(teamSlug)
  
  if (!teamWithCustomer) {
    return notFound()
  }

  // ✅ Prepare checkout with customer attachment
  const checkoutResult = await createMarketingCheckout({
    teamId: teamWithCustomer.id,
    existingStripeCustomerId: teamWithCustomer.stripeCustomer?.id,
    userEmail: user.email,
    // ... other fields
  })

  if ('error' in checkoutResult) {
    return <CheckoutError error={checkoutResult.error} />
  }

  return <CheckoutSession url={checkoutResult.url} />
}
```

**Update:** `src/plugins/site-billing/marketingCheckout.ts`

```typescript
export async function createMarketingCheckout(args: {
  existingStripeCustomerId?: string
  userEmail?: string
  teamId?: string
  // ...
}): Promise<CheckoutResult> {
  const { existingStripeCustomerId, userEmail, teamId } = args

  // ✅ Type validation at boundary
  if (typeof existingStripeCustomerId !== 'string' && existingStripeCustomerId !== undefined) {
    return { error: 'Invalid Stripe customer Id' }
  }

  const provider = resolveMarketingCheckoutProvider()

  try {
    if (provider === 'stripe') {
      // ✅ Attach existing customer to session
      const sessionData: Parameters<typeof stripe.checkout.sessions.create>[0] = {
        customer: existingStripeCustomerId || undefined,
        customer_email: existingStripeCustomerId ? undefined : userEmail,
        // ... other fields
      }

      const session = await stripe.checkout.sessions.create(sessionData)
      return { provider: 'stripe', url: session.url || '' }
    }

    // ... handle Revolut, etc.
  } catch (err) {
    console.error('Checkout creation failed:', err)
    return { error: 'Failed to create checkout session' }
  }
}
```

---

### **GAP 5: Toast Notifications Missing in Settings**

**Pattern Across:**
- `src/app/(frontend)/(cloud)/cloud/.../settings/domains/AddDomain/index.tsx`
- `src/app/(frontend)/(cloud)/cloud/.../settings/plan/DeletePlanModal/index.tsx`

**Rule Violation:**
- ❌ No user feedback on success/failure
- ❌ No consistency in error handling

**Fix (Apply Consistent Error Feedback Pattern):**

```typescript
// All settings forms should follow this pattern:

async function handleSubmit(data: FormData) {
  try {
    setIsLoading(true)
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    // ✅ TYPE AT EDGE
    const result: unknown = await response.json()
    
    if (!response.ok) {
      const errorMsg = extractErrorMessage(result)
      toast.error(errorMsg || 'Operation failed')
      return
    }

    toast.success('Successfully saved')
    
    // ✅ Invalidate cache or update state
    await revalidateCache({ tags: [...tags] })
    
  } catch (error) {
    console.error(error)
    toast.error('Network error. Please try again.')
  } finally {
    setIsLoading(false)
  }
}

function extractErrorMessage(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    return String((data as any).message)
  }
  return undefined
}
```

---

### **GAP 6: Consolidate Docs Routes (Remove v1/v2 Duplication)**

**Files:**
- `src/app/(frontend)/(pages)/docs/[topic]/[doc]/page.tsx` (canonical)
- `src/app/(frontend)/(pages)/docs/v2/[topic]/[doc]/page.tsx` (legacy)
- `src/app/(frontend)/(pages)/docs/dynamic/[topic]/[doc]/page.tsx` (transitional)

**Rule Violation:**
- ❌ Three separate implementations of same feature
- ❌ Feature flags control visibility but don't remove code
- ❌ No clear canonical version

**Fix (Single Canonical Route):**

```typescript
// Keep only: src/app/(frontend)/(pages)/docs/[topic]/[doc]/page.tsx

import { notFound } from 'next/navigation'
import { docsTemplateEnabled } from '@root/plugins/env'
import { fetchDoc } from '@root/app/_data'

export async function generateMetadata({ 
  params: { topic, doc } 
}: DocPageProps): Promise<Metadata> {
  if (!docsTemplateEnabled()) {
    return {}
  }

  const docData = await fetchDoc(topic, doc)
  if (!docData) return {}

  return {
    title: docData.title,
    description: docData.description,
    // ...
  }
}

export default async function DocPage({ 
  params: { topic, doc } 
}: DocPageProps) {
  // ✅ SCHEMA-FIRST: Check feature flag at top
  if (!docsTemplateEnabled()) {
    notFound()
  }

  const docData = await fetchDoc(topic, doc)
  if (!docData) {
    notFound()
  }

  return (
    <DocRenderer doc={docData} />
  )
}
```

**Delete:**
- `src/app/(frontend)/(pages)/docs/v2/...` (entire folder)
- `src/app/(frontend)/(pages)/docs/dynamic/...` (entire folder)

---

### **GAP 7: Form Type Safety**

**Pattern:** Untyped form callbacks across Cloud UI

**Rule Violation:**
- ❌ `data` parameter is `any`
- ❌ Field names aren't validated at compile-time

**Fix (Add Form Types):**

```typescript
// src/types/forms.ts

export interface EnvironmentVariableFormData {
  envKey: string
  envValue: string
}

export interface DomainFormData {
  domain: string
  certificateArn?: string
}

export interface PlanFormData {
  planId: string
  quantity: number
}

// Usage in components:
import type { EnvironmentVariableFormData } from '@root/types/forms'

const updateEnv = useCallback(async (data: EnvironmentVariableFormData) => {
  const { envKey, envValue } = data // ✅ Type-safe, IdE autocomplete works
  // ...
}, [...])
```

---

## Implementation Priority

### **Phase 1: Critical (Do First)**
1. ✅ Fix env var state sync (GAP 1)
2. ✅ Add delete error handling (GAP 2)
3. ✅ Centralize Stripe types (GAP 3)

### **Phase 2: High Impact (Do Soon)**
4. ✅ Complete checkout customer attachment (GAP 4)
5. ✅ Wire toast notifications everywhere (GAP 5)
6. ✅ Add form type safety (GAP 7)

### **Phase 3: Architecture (Do Next)**
7. ✅ Consolidate docs routes (GAP 6)
8. ✅ Centralize Cloud API types
9. ✅ Create `@types/cloud-api.ts`

---

## Verification Checklist

After implementing, verify:

- [ ] **No `any` types** — Check with `grep -r " any" src/app/\(frontend\)/\(cloud\)`
- [ ] **Type at edge** — All API responses validated before use
- [ ] **Single source of truth** — State updates sync with server
- [ ] **Toast feedback** — Every API call has success/error toast
- [ ] **No duplication** — Types centralized in `@types/*`
- [ ] **Routes consolidated** — Only one canonical version per feature
- [ ] **Cache tags** — Payload cache invalidation works end-to-end

---

## Pattern Rules to Enforce

### Going Forward:

1. **All external API responses must be `unknown` + validated**
   ```typescript
   const data: unknown = await response.json()
   if (!isValidShape(data)) throw new Error(...)
   ```

2. **All form submissions must have toast feedback**
   ```typescript
   try {
     await api.call()
     toast.success('Done!')
   } catch (e) {
     toast.error('Failed')
   }
   ```

3. **State updates must sync with server mutations**
   ```typescript
   onSuccess: () => {
     setLocal(updated)  // ← Update local state
     await revalidateCache(...)  // ← Sync with server
   }
   ```

4. **Types belong in `@types/` or near schema**
   ```typescript
   // ✅ Central:  @types/stripe.ts
   // ✅ Near schema: src/types/forms.ts
   // ❌ Scattered: one per file
   ```

5. **No duplication; consolidate before scaling**
   ```typescript
   // Before adding a 3rd version → consolidate first
   // docs/v1, docs/v2, docs/dynamic
   // → Choose canonical: docs/[topic]/[doc]
   ```

