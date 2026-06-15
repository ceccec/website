/**
 * Marketing Checkout Handler
 *
 * Creates Stripe checkout sessions or Revolut payment links for user subscription purchases.
 * Consolidates: src/plugins/stripe/marketingCheckout and src/plugins/revolut/marketing
 */

import Stripe from 'stripe'

const STRIPE_API_VERSION = '2026-05-27.dahlia'

interface CreateMarketingCheckoutParams {
  cancelUrl: string
  existingStripeCustomerId?: string
  payloadUserId: string
  plan?: 'enterprise' | 'pro' | 'starter'
  priceId?: string
  successUrl: string
  userEmail?: string
}

interface CheckoutResult {
  provider: 'stripe' | 'revolut'
  url: string
}

interface CheckoutError {
  error: string
}

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY not configured')
  }
  return new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
    appInfo: {
      name: 'payload-website',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://payloadcms.com',
    },
  })
}

function getRevolutMerchantAccountUrl(): string | undefined {
  return process.env.REVOLUT_MERCHANT_ACCOUNT_URL
}

export async function createMarketingCheckout(
  params: CreateMarketingCheckoutParams,
): Promise<CheckoutResult | CheckoutError> {
  const { cancelUrl, existingStripeCustomerId, payloadUserId, plan, priceId, successUrl, userEmail } =
    params

  if (priceId && !plan) {
    return await createStripeCheckout({
      cancelUrl,
      customerEmail: userEmail,
      customerId: existingStripeCustomerId,
      priceId,
      successUrl,
      userId: payloadUserId,
    })
  }

  if (plan && !priceId) {
    return createRevolutPaymentLink({
      cancelUrl,
      plan,
      successUrl,
      userId: payloadUserId,
    })
  }

  if (priceId && plan) {
    const stripeResult = await createStripeCheckout({
      cancelUrl,
      customerEmail: userEmail,
      customerId: existingStripeCustomerId,
      priceId,
      successUrl,
      userId: payloadUserId,
    })

    if ('error' in stripeResult) {
      return createRevolutPaymentLink({
        cancelUrl,
        plan,
        successUrl,
        userId: payloadUserId,
      })
    }

    return stripeResult
  }

  return { error: 'No payment method specified' }
}

async function createStripeCheckout(params: {
  cancelUrl: string
  customerEmail?: string
  customerId?: string
  priceId: string
  successUrl: string
  userId: string
}): Promise<CheckoutResult | CheckoutError> {
  try {
    const stripe = getStripeClient()

    let customerId = params.customerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: params.customerEmail,
        metadata: {
          payloadUserId: params.userId,
        },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        payloadUserId: params.userId,
      },
    })

    if (!session.url) {
      return { error: 'Failed to create checkout session' }
    }

    return {
      provider: 'stripe',
      url: session.url,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create Stripe checkout'
    return { error: message }
  }
}

function createRevolutPaymentLink(params: {
  cancelUrl: string
  plan: 'enterprise' | 'pro' | 'starter'
  successUrl: string
  userId: string
}): CheckoutResult | CheckoutError {
  const accountUrl = getRevolutMerchantAccountUrl()
  if (!accountUrl) {
    return { error: 'Revolut not configured' }
  }

  const planPrices: Record<string, number> = {
    starter: 3900,
    pro: 9900,
    enterprise: 0,
  }

  const price = planPrices[params.plan]
  if (price === undefined) {
    return { error: 'Invalid plan' }
  }

  if (params.plan === 'enterprise') {
    return { error: 'Contact sales for enterprise plan' }
  }

  return {
    provider: 'revolut',
    url: accountUrl,
  }
}
