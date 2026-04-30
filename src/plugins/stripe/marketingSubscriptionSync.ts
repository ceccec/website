import type { Payload, PayloadRequest } from 'payload'
import type Stripe from 'stripe'

import type { SubscriptionPlan } from '@root/access/subscriptionAccess'
import { subscriptionPlanRank } from '@root/access/subscriptionAccess'
import { getPayload } from '@root/plugins/payload-runtime/getPayload'
import { uuidTags } from '@uuid'
import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'

import { getStripeServer } from './server'

/** Normalize Stripe Price / Product `metadata.plan_tier` into Payload `users.subscriptionPlan`. */
export function normalizePlanTier(raw: null | string | undefined): SubscriptionPlan {
  const v = String(raw ?? '')
    .toLowerCase()
    .trim()
  if (v === 'starter' || v === 'basic' || v === 'standard') {
    return 'starter'
  }
  if (v === 'pro' || v === 'professional' || v === 'plus') {
    return 'pro'
  }
  if (v === 'enterprise' || v === 'ent') {
    return 'enterprise'
  }
  if (v === 'none' || v === '') {
    return 'none'
  }
  return 'none'
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): 'active' | 'canceled' | 'inactive' | 'past_due' {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
    case 'unpaid':
      return 'past_due'
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled'
    case 'paused':
    case 'incomplete':
    default:
      return 'inactive'
  }
}

async function highestPlanFromSubscription(
  subscription: Stripe.Subscription,
  stripe: Stripe,
): Promise<SubscriptionPlan> {
  let best: SubscriptionPlan = 'none'
  let bestRank = 0

  for (const item of subscription.items.data) {
    let price = item.price
    if (typeof price === 'string') {
      price = await stripe.prices.retrieve(price)
    }
    let metaTier: string | undefined = price.metadata?.plan_tier
    const productRef = price.product
    if (!metaTier && typeof productRef === 'string') {
      const product = await stripe.products.retrieve(productRef)
      if (!product.deleted) {
        metaTier = product.metadata?.plan_tier
      }
    } else if (!metaTier && productRef && typeof productRef === 'object' && !productRef.deleted) {
      metaTier = productRef.metadata?.plan_tier
    }
    const candidate = normalizePlanTier(metaTier)
    const r = subscriptionPlanRank(candidate)
    if (r > bestRank) {
      bestRank = r
      best = candidate
    }
  }

  return bestRank > 0 ? best : 'none'
}

async function resolvePayloadUserIdForCustomer(
  payload: Payload,
  stripe: Stripe,
  customerId: string,
): Promise<number | string | null> {
  const existing = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      stripeCustomerId: {
        equals: customerId,
      },
    },
  })
  const doc = existing.docs[0]
  if (doc?.id != null) {
    return doc.id
  }

  const customer = await stripe.customers.retrieve(customerId)
  if (customer.deleted) {
    return null
  }
  const metaId = customer.metadata?.payload_user_id
  if (metaId) {
    const byMeta = await payload.findById({
      id: metaId,
      collection: 'users',
      depth: 0,
      overrideAccess: true,
    }).catch(() => null)
    if (byMeta?.id != null) {
      return byMeta.id
    }
  }
  return null
}

function periodEndFromSubscription(subscription: Stripe.Subscription): string | undefined {
  const end = subscription.current_period_end
  if (typeof end !== 'number') {
    return undefined
  }
  return new Date(end * 1000).toISOString()
}

async function applyUserSubscriptionPatch(
  payload: Payload,
  userId: number | string,
  patch: {
    stripeCustomerId?: string
    subscriptionCurrentPeriodEnd?: null | string
    subscriptionPlan?: SubscriptionPlan
    subscriptionStatus: 'active' | 'canceled' | 'inactive' | 'past_due'
  },
): Promise<void> {
  const current = await payload.findById({
    id: userId,
    collection: 'users',
    depth: 0,
    overrideAccess: true,
  })
  const doc = current as unknown as Record<string, unknown> | null
  const prevVersion = typeof doc?.entitlementVersion === 'number' ? doc.entitlementVersion : 0

  const data = {
    entitlementVersion: prevVersion + 1,
    ...patch,
  }

  await payload.update({
    id: userId,
    collection: 'users',
    data: data as never,
    overrideAccess: true,
  })

  revalidateTagImmediate(uuidTags.subscriberEntitlement(userId))
  revalidateTagImmediate(uuidTags.collectionId('users', userId))
}

/** Core dispatcher — `/api/webhooks/stripe` and ecommerce adapter (`/api/payments/stripe/webhooks`). */
export async function dispatchMarketingStripeEvent(event: Stripe.Event): Promise<void> {
  const stripe = getStripeServer()
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  const payload = await getPayload()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutSessionCompleted(payload, stripe, session)
      return
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await handleCustomerSubscription(payload, stripe, subscription)
      return
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = subscriptionFromInvoice(invoice)
      if (!subId) {
        return
      }
      const subscription = await stripe.subscriptions.retrieve(subId)
      await handleCustomerSubscription(payload, stripe, subscription)
      return
    }
    default:
      return
  }
}

function subscriptionFromInvoice(invoice: Stripe.Invoice): string | undefined {
  const sub = invoice.subscription
  if (sub === null || sub === undefined) {
    return undefined
  }
  if (typeof sub === 'string') {
    return sub
  }
  return sub.id
}

async function handleCheckoutSessionCompleted(
  payload: Payload,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
  if (!customerId) {
    return
  }

  const metaUserId = session.metadata?.payload_user_id || session.client_reference_id
  let userId: number | string | null = null

  if (metaUserId) {
    const u = await payload
      .findById({
        id: metaUserId,
        collection: 'users',
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => null)
    if (u?.id != null) {
      userId = u.id
    }
  }

  if (userId == null) {
    userId = await resolvePayloadUserIdForCustomer(payload, stripe, customerId)
  }

  if (userId == null) {
    return
  }

  let subscriptionPlan: SubscriptionPlan = 'none'
  let subscriptionCurrentPeriodEnd: string | undefined

  if (session.mode === 'subscription') {
    const subRef = session.subscription
    const sid = typeof subRef === 'string' ? subRef : subRef?.id
    if (sid) {
      const sub = await stripe.subscriptions.retrieve(sid)
      subscriptionPlan = await highestPlanFromSubscription(sub, stripe)
      subscriptionCurrentPeriodEnd = periodEndFromSubscription(sub)
    }
  }

  await applyUserSubscriptionPatch(payload, userId, {
    stripeCustomerId: customerId,
    subscriptionCurrentPeriodEnd,
    subscriptionPlan,
    subscriptionStatus: 'active',
  })
}

async function handleCustomerSubscription(
  payload: Payload,
  stripe: Stripe,
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id
  if (!customerId) {
    return
  }

  const userId = await resolvePayloadUserIdForCustomer(payload, stripe, customerId)
  if (userId == null) {
    return
  }

  const status = mapStripeSubscriptionStatus(subscription.status)
  const plan =
    status === 'active' || status === 'past_due'
      ? await highestPlanFromSubscription(subscription, stripe)
      : ('none' as const)

  await applyUserSubscriptionPatch(payload, userId, {
    stripeCustomerId: customerId,
    subscriptionCurrentPeriodEnd:
      status === 'canceled' || status === 'inactive'
        ? null
        : periodEndFromSubscription(subscription),
    subscriptionPlan: plan,
    subscriptionStatus: status,
  })
}

/** Payload ecommerce adapter — event already verified by the plugin. */
export async function marketingStripeWebhookHandler(args: {
  event: Stripe.Event
  req: PayloadRequest
  stripe: Stripe
}): Promise<void> {
  await dispatchMarketingStripeEvent(args.event)
}

/** Pass into `stripeAdapter({ webhooks })` with ecommerce enabled. */
export const marketingStripeWebhookHandlers = {
  'checkout.session.completed': marketingStripeWebhookHandler,
  'customer.subscription.deleted': marketingStripeWebhookHandler,
  'customer.subscription.updated': marketingStripeWebhookHandler,
  'invoice.payment_failed': marketingStripeWebhookHandler,
} as const
