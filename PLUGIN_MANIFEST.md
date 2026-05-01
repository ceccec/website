# Plugin Manifest

**Date:** May 1, 2026  
**Purpose:** Defines responsibilities, interfaces, and boundaries for all plugins  
**Version:** 1.0

---

## Payments Plugin

**Path:** `src/plugins/payments/`  
**Status:** ✅ Production-ready (consolidated from 4 plugins)  
**Consolidated from:** stripe/, revolut/, site-billing/

### Responsibility

Unified payment processing for all subscription tiers and deployments.

**Owns:**
- Card validation via SetupIntent
- Subscription creation and lifecycle management
- Payment method storage and default selection
- Invoice retrieval and management
- Multi-provider abstraction (Stripe, Revolut, future providers)
- Webhook handling from payment providers
- Sync between payment provider and Payload CMS

**Does NOT own:**
- Plan definitions (owned by schema plugin)
- Team/organization management (owned by schema plugin)
- Deployment orchestration (owned by deploy flow)
- Business logic beyond payments (owned by services)

### Collections Owned

**subscriptions** — Active and historical subscriptions
```typescript
interface Subscription {
  id: string
  team: string (reference)
  plan: string (reference)
  externalId: string // Provider subscription ID
  status: 'active' | 'past_due' | 'incomplete' | 'trialing' | 'canceled'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  freeTrial: boolean
}
```

### Public Interface

**Exports from `src/plugins/payments/`:**

#### Types
```typescript
export type { PaymentProvider }
export type { SetupIntentResponse, SubscriptionResponse, PaymentResult }
```

#### Provider Factory
```typescript
export function getPaymentProvider(): PaymentProvider
export function createProvider(name: 'stripe' | 'revolut'): PaymentProvider
export function getAvailableProviders(): string[]
```

#### PaymentProvider Interface
```typescript
interface PaymentProvider {
  createSetupIntent(teamId: string): Promise<SetupIntentResponse>
  confirmSetupIntent(clientSecret: string, paymentMethodId: string): Promise<PaymentResult>
  createSubscription(teamId, planId, paymentMethodId?, options?): Promise<SubscriptionResponse>
  confirmPayment(clientSecret, paymentMethodId): Promise<PaymentResult>
  cancelSubscription(subscriptionId): Promise<void>
  getSubscription(subscriptionId): Promise<SubscriptionResponse>
  setDefaultPaymentMethod(customerId, paymentMethodId): Promise<void>
  getInvoices(customerId): Promise<Invoice[]>
}
```

### Server Actions

**Location:** `src/app/.../cloud/_actions/paymentActions.ts`

- `createSetupIntentAction(teamId)` — Create card validation intent
- `createSubscriptionAction(teamId, planId, paymentMethodId?, options?)` — Create subscription
- `updatePaymentMethodAction(teamId, paymentMethodId)` — Set default method
- `getTeamSubscriptionAction(teamId)` — Retrieve active subscription
- `cancelSubscriptionAction(subscriptionId)` — Cancel subscription

### Business Logic Services

**Location:** `src/plugins/payments/services/`

**subscriptionService.ts:**
- `createSubscription()` — Provider + CMS sync
- `updateSubscription()` — Sync provider and CMS
- `cancelSubscription()` — Provider + CMS sync
- `getSubscription()` — Retrieve from provider
- `getTeamSubscription()` — Query active subscription

**paymentMethodService.ts:**
- `setDefaultPaymentMethod()` — Provider + CMS
- `hasDefaultPaymentMethod()` — Check configuration
- `getDefaultPaymentMethod()` — Retrieve current
- `clearDefaultPaymentMethod()` — Remove setting

### Provider Implementations

**Stripe** (`src/plugins/payments/providers/stripe.ts`)
- Complete implementation of PaymentProvider
- Uses Stripe SDK for all operations
- Environment: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

**Revolut** (`src/plugins/payments/providers/revolut.ts`)
- Placeholder implementation (ready for full implementation)
- Uses Revolut API for operations
- Environment: `REVOLUT_API_KEY`, `REVOLUT_MERCHANT_ID`

### Webhook Handling

**Stripe:** POST `/webhooks/stripe`
- Events: subscription updates, payment failures, charge disputes
- Handler: `src/plugins/payments/providers/stripe.ts`

**Revolut:** POST `/webhooks/revolut`
- Events: payment link completed, order updates
- Handler: `src/plugins/payments/providers/revolut.ts`

### Dependencies

**Required:**
- Payload CMS — For storing subscriptions as source of truth
- Stripe SDK — For Stripe provider
- Environment variables — Provider credentials

**Optional:**
- Revolut SDK — For Revolut provider (if enabled)

### Configuration

**Environment Variables:**
```bash
# Required
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
PAYMENT_PROVIDER=stripe  # Default provider
REVOLUT_API_KEY=...
REVOLUT_MERCHANT_ID=...
```

### Usage Examples

**From server actions:**
```typescript
const intent = await createSetupIntentAction(teamId)
const subscription = await createSubscriptionAction(teamId, planId, paymentMethodId)
await updatePaymentMethodAction(teamId, paymentMethodId)
```

**From services:**
```typescript
const sub = await createSubscription(payload, teamId, planId, paymentMethodId, { freeTrial: true })
await setDefaultPaymentMethod(payload, teamId, paymentMethodId)
```

**Direct provider access:**
```typescript
const provider = getPaymentProvider()
const intent = await provider.createSetupIntent(teamId)
const subscription = await provider.getSubscription(subscriptionId)
```

### Migration from Old Plugins

**Stripe plugin (`src/plugins/stripe/`)** → **Payments plugin**
- `getStripeServer()` → `getPaymentProvider()`
- `createStripeCheckoutSession()` → `createSubscriptionAction()`
- Webhook handlers → `paymentActions.ts`

**Revolut plugin (`src/plugins/revolut/`)** → **Payments plugin**
- `buildCheckoutUrl()` → Provider factory + `createSubscriptionAction()`
- Webhook handlers → Payments plugin webhooks

**Site-billing plugin (`src/plugins/site-billing/`)** → **Payments plugin**
- Checkout config → Server actions
- Plan selection → Client component logic
- Billing orchestration → `subscriptionService`

### Testing

**Unit tests:** `src/plugins/payments/__tests__/`
- Provider factory selection
- Service business logic
- Type guards and validation

**Integration tests:** `src/__tests__/integration/payments/`
- End-to-end subscription creation
- Payment confirmation flow
- Webhook handling
- Payload CMS sync

**Manual testing:**
- Deploy flow with Stripe (full sandbox)
- Subscribe with free trial
- Cancel subscription
- Webhook events in Stripe dashboard

### Future Enhancements

1. **Additional providers:** PayPal, Square, custom processors
2. **Webhook retry logic:** Automatic retry for failed webhooks
3. **Invoice PDF generation:** Create/store PDF invoices
4. **Billing portal:** Self-service subscription management
5. **Usage-based billing:** Per-API-call pricing model

### Contact & Support

**Maintainer:** DevOps team  
**Documentation:** This file + inline code comments  
**Issues:** Create issue in GitHub with `[payments-plugin]` label

---

## Other Plugins

### Schema Plugin
**Path:** `src/plugins/schema/`  
**Responsibility:** Define core business entities (teams, projects, plans, users)  
**Does NOT:** Payment processing, billing, deployment

### Website Plugin
**Path:** `src/plugins/website/`  
**Responsibility:** SEO, nested docs, forms, storage  
**Does NOT:** Payment processing, user management

### Multi-tenant Plugin
**Path:** `src/plugins/multi-tenant/`  
**Responsibility:** Tenant scope resolution, access control  
**Does NOT:** Payment processing, business logic

---

**Version:** 1.0 | Last updated: May 1, 2026 | Phase 3 complete
