# Payment Flow Audit — Current Architecture

**Date:** April 30, 2026  
**Purpose:** Map current payment processing before consolidation  
**Status:** Phase 3, Step 1

---

## Current Plugin Structure

### `src/plugins/stripe/` (422 lines)
**Files:**
- `server.ts` (33 lines) — Stripe client initialization
- `subscriptionCheckout.ts` (71 lines) — Checkout session creation
- `marketingSubscriptionSync.ts` (318 lines) — Webhook handlers, subscription sync
- `index.ts` (18 lines) — Exports

**Responsibility:** Stripe-specific integration
- Creates SetupIntent for card validation
- Creates Subscription on Stripe
- Handles webhook events
- Syncs subscription status back to Payload

**Key Exports:**
```typescript
getStripeServer()                          // Lazy singleton Stripe client
stripeWebhookSecret()                      // Webhook secret
createStripeCheckoutSession()              // Marketing checkout
createStripeBillingPortalSession()         // Billing portal
marketingStripeWebhookHandler()            // Webhook dispatcher
```

### `src/plugins/revolut/` (139 lines)
**Files:**
- `buildCheckoutUrl.ts` (75 lines) — Payment link builder
- `env.ts` (32 lines) — Environment config
- `mapPriceIdToPlan.ts` (23 lines) — Plan ID mapping
- `index.ts` (8 lines) — Exports
- `types.ts` (1 line) — Type definitions

**Responsibility:** Revolut payment link integration
- Builds Revolut payment links
- Maps plan IDs to Revolut price IDs
- Alternative to Stripe checkout

**Key Exports:**
```typescript
buildCheckoutUrl()                         // Create payment link
mapPriceIdToPlan()                         // Map price to plan
```

### `src/plugins/site-billing/` (132 lines)
**Files:**
- `marketingBilling.ts` (36 lines) — Billing page data
- `marketingCheckout.ts` (94 lines) — Checkout selection logic
- `index.ts` (2 lines) — Exports

**Responsibility:** Billing orchestration
- Determines which payment provider to use
- Handles plan selection UI logic
- Prepares checkout configuration

**Key Exports:**
```typescript
getCheckoutConfig()                        // Get checkout setup
mapPlans()                                 // Transform plans for UI
```

### `src/plugins/payments/` (Empty directories)
- `stripe/` — Currently empty
- `paymentLink/` — Currently empty

**Status:** Reserved for consolidation but unused

---

## Deployment Flow: HTTP API Calls

### Current Flow (useStripeDeployment.ts)

**Stage 1: Card Validation**
```typescript
const setupResponse = await fetch(
  `${NEXT_PUBLIC_CLOUD_CMS_URL}/api/stripe/setup-intent`,
  { method: 'POST', body: JSON.stringify({ teamID }) }
)
```

**Stage 2: Set Default Payment Method**
```typescript
await updateCustomer(checkoutState.team, {
  invoice_settings: { default_payment_method: pmId }
})
```

**Stage 3: Deploy Project**
```typescript
const deployResponse = await fetch(
  `${NEXT_PUBLIC_CLOUD_CMS_URL}/api/deploy`,
  { method: 'POST', body: JSON.stringify({ project: {...} }) }
)
```

**Stage 4: Create Subscription**
```typescript
const subscriptionResponse = await fetch(
  `${NEXT_PUBLIC_CLOUD_CMS_URL}/api/subscriptions`,
  { method: 'POST', body: JSON.stringify({ plan, team, freeTrial }) }
)
```

**Stage 5: Confirm Payment**
```typescript
const confirmPaymentResult = await stripe.confirmCardPayment(
  subscription.client_secret,
  { payment_method: paymentMethodId }
)
```

---

## API Endpoints Referenced

### `/api/stripe/setup-intent`
**Location:** (Not found in codebase — likely external or middleware)  
**Purpose:** Create Stripe SetupIntent  
**Input:** `{ teamID: string }`  
**Output:** `{ client_secret: string }`

### `/api/deploy`
**Location:** `src/app/(frontend)/(cloud)/new/(checkout)/deploy.tsx` references it  
**Purpose:** Create project deployment  
**Input:** Complex project config  
**Output:** `{ doc?: Project, error?: string }`

### `/api/subscriptions`
**Location:** Referenced in useStripeDeployment.ts  
**Purpose:** Create subscription  
**Input:** `{ plan, team, freeTrial }`  
**Output:** `{ subscription: unknown }`

---

## Data Flow Analysis

### Current State: Distributed Logic
```
Client Component (deploy.tsx)
  ↓ fetch /api/stripe/setup-intent
API Route (NOT FOUND)
  ↓ Creates Stripe SetupIntent
  ↓ fetch /api/deploy
API Route (NOT FOUND)
  ↓ Saves to Payload CMS
  ↓ fetch /api/subscriptions
API Route (NOT FOUND)
  ↓ Creates Stripe Subscription
  ↓ Saves to Payload CMS
Client gets response
```

### Problem: 4 HTTP round trips
- Extra latency
- Extra serialization/deserialization
- Complex error handling
- Difficult to test

---

## Type Information Needed

### SetupIntent Response
```typescript
interface StripeSetupIntentResponse {
  client_secret: string
}
```

### Subscription Response
```typescript
interface StripeSubscriptionResponse {
  subscription: {
    client_secret: string
    id: string
    status: 'active' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'succeeded' | 'canceled'
  }
}
```

### Project Deploy Request
```typescript
interface DeployRequest {
  project: {
    id?: string
    freeTrial?: boolean
    paymentMethod?: string
    template?: string
    plan: string
    team: string
    projectName?: string
    environmentVariables?: Array<{ key: string; value: string }>
    domains?: string[]
  }
}
```

---

## Problems Identified

### 1. **Duplicate Payment Processing**
- Stripe plugin handles subscriptions
- Site-billing also handles checkout config
- Revolut handles alternative payment links
- No clear single source of truth

### 2. **API Call Chain**
- 4 sequential HTTP calls for one deployment
- Could be 1 server action with local API calls

### 3. **Missing Error Handling Abstraction**
- Each fetch has its own error handling
- No standardized error recovery

### 4. **Unclear Provider Selection**
- Site-billing decides provider (Stripe vs Revolut)
- But implementation details in separate plugins
- No provider interface to swap implementations

### 5. **Webhook Handling Scattered**
- Stripe webhooks in stripe/marketingSubscriptionSync.ts
- Revolut webhooks location unknown
- No unified webhook dispatcher

---

## Consolidation Strategy

### Goal
Single `src/plugins/payments/` plugin that:
1. ✅ Supports multiple providers (Stripe, Revolut)
2. ✅ Exposes clean PaymentProvider interface
3. ✅ Handles all subscription lifecycle (create, update, cancel, sync)
4. ✅ Saves source of truth to Payload CMS
5. ✅ Handles webhooks from all providers
6. ✅ Provides server actions for client to call

### Step-by-Step

**Step 1: Create provider interface**
```typescript
interface PaymentProvider {
  createSetupIntent(teamId: string): Promise<SetupIntentResponse>
  createSubscription(teamId: string, planId: string): Promise<SubscriptionResponse>
  confirmPayment(paymentMethodId: string, clientSecret: string): Promise<PaymentResult>
  cancelSubscription(subscriptionId: string): Promise<void>
}
```

**Step 2: Implement providers**
- StripeProvider implements PaymentProvider
- RevolutProvider implements PaymentProvider
- Factory function to select provider

**Step 3: Create business logic services**
- SubscriptionService (create, update, cancel)
- PaymentMethodService (validate, set default)
- InvoiceService (generate, retrieve)

**Step 4: Create server actions**
- deployProjectAction()
- createSubscriptionAction()
- updatePaymentMethodAction()

**Step 5: Migrate HTTP calls to server actions**
- Remove fetch() from deploy.tsx
- Call server actions instead
- Type-safe end-to-end

**Step 6: Consolidate webhooks**
- Single webhook dispatcher
- Routes to appropriate provider handler
- Syncs results to Payload CMS

**Step 7: Remove old plugins**
- Delete src/plugins/stripe/
- Delete src/plugins/revolut/
- Delete src/plugins/site-billing/
- All functionality in src/plugins/payments/

---

## Success Criteria

✅ **Single payments plugin** with clear responsibility  
✅ **PaymentProvider interface** supports multiple providers  
✅ **Zero HTTP round trips** for deployment flow  
✅ **Type-safe API** with full TypeScript coverage  
✅ **Payload CMS as source of truth** for subscriptions  
✅ **Clean error handling** with standardized patterns  
✅ **Unified webhook handling** for all providers  
✅ **Server actions** replace fetch() calls  
✅ **Comprehensive tests** for payment flow  
✅ **Clear documentation** of plugin interface  

---

## Next: Step 2 — Extract Common Interfaces

Create `src/plugins/payments/types.ts` with:
- PaymentProvider interface
- SetupIntentResponse, SubscriptionResponse types
- Error types for payment failures
- Type guards for runtime validation

---

**Audit Complete:** Ready for consolidation
