/**
 * Marketing Billing Portal Handler
 *
 * Creates Stripe billing portal sessions for user subscription management.
 * Consolidates: src/plugins/stripe/marketingBilling
 */

import Stripe from 'stripe'

const STRIPE_API_VERSION = '2026-05-27.dahlia'

interface CreateMarketingBillingSessionParams {
  payloadUserId: string
  returnUrl: string
  stripeCustomerId?: string
}

interface BillingResult {
  url: string
}

interface BillingError {
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

export async function createMarketingBillingSession(
  params: CreateMarketingBillingSessionParams,
): Promise<BillingResult | BillingError> {
  const { payloadUserId, returnUrl, stripeCustomerId } = params

  if (!stripeCustomerId) {
    const revURL = getRevolutMerchantAccountUrl()
    if (revURL) {
      return {
        url: revURL,
      }
    }
    return { error: 'No payment provider configured' }
  }

  try {
    const stripe = getStripeClient()

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    })

    return {
      url: session.url,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create billing session'
    return { error: message }
  }
}
