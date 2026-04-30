import Stripe from 'stripe'

/** Align with `@payloadcms/plugin-ecommerce` Stripe adapter default. */
const STRIPE_API_VERSION = '2025-03-31.basil' as Stripe.StripeConfig['apiVersion']

let stripeSingleton: null | Stripe = null

/**
 * Server-only Stripe client (`STRIPE_SECRET_KEY`). Lazy singleton — safe when keys are unset.
 * When Stripe is off, use `@root/plugins/revolut` payment-link checkout instead.
 */
export function getStripeServer(): null | Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) {
    return null
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, {
      apiVersion: STRIPE_API_VERSION as Stripe.StripeConfig['apiVersion'],
      appInfo: {
        name: 'payload-website',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://payloadcms.com',
      },
    })
  }
  return stripeSingleton
}

export function stripeWebhookSecret(): string | undefined {
  return (
    process.env.STRIPE_WEBHOOK_SECRET?.trim() || process.env.STRIPE_WEBHOOKS_SIGNING_SECRET?.trim()
  )
}
