import { getStripeServer } from './server'

export type CreateStripeCheckoutSessionArgs = {
  cancelUrl: string
  existingStripeCustomerId?: null | string
  payloadUserId: number | string
  priceId: string
  successUrl: string
}

export type CreateStripeBillingPortalArgs = {
  returnUrl: string
  stripeCustomerId: string
}

/** Stripe Checkout Session — Price should set `metadata.plan_tier` for CMS gates. */
export async function createStripeSubscriptionCheckoutSession(
  args: CreateStripeCheckoutSessionArgs,
): Promise<{ error: string } | { url: string }> {
  const stripe = getStripeServer()
  if (!stripe) {
    return { error: 'Stripe is not configured' }
  }

  const base = {
    allow_promotion_codes: true,
    cancel_url: args.cancelUrl,
    client_reference_id: String(args.payloadUserId),
    line_items: [{ price: args.priceId, quantity: 1 }],
    metadata: {
      payload_user_id: String(args.payloadUserId),
    },
    mode: 'subscription' as const,
    success_url: args.successUrl,
  }

  const session = await stripe.checkout.sessions.create(
    args.existingStripeCustomerId?.trim()
      ? {
          ...base,
          customer: args.existingStripeCustomerId.trim(),
          customer_update: { name: 'auto', address: 'auto', shipping: 'auto' },
        }
      : {
          ...base,
          customer_creation: 'always' as const,
        },
  )

  if (!session.url) {
    return { error: 'Checkout session missing redirect URL' }
  }

  return { url: session.url }
}

export async function createStripeBillingPortalSession(
  args: CreateStripeBillingPortalArgs,
): Promise<{ error: string } | { url: string }> {
  const stripe = getStripeServer()
  if (!stripe) {
    return { error: 'Stripe is not configured' }
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: args.stripeCustomerId,
    return_url: args.returnUrl,
  })

  return { url: session.url }
}
