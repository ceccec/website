/**
 * Stripe Plugin — Marketing Webhook Handlers
 *
 * Consolidates marketing Stripe webhook handling from the legacy stripe plugin.
 * See: src/plugins/payments/providers/stripe.ts for payment provider implementation
 */

import Stripe from 'stripe'

const STRIPE_API_VERSION = '2025-03-31.basil' as Stripe.StripeConfig['apiVersion']

/**
 * Get Stripe server instance
 */
export function getStripeServer(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) {
    return null
  }
  return new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
    appInfo: {
      name: 'payload-website',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://payloadcms.com',
    },
  })
}

/**
 * Get Stripe webhook signing secret
 */
export function stripeWebhookSecret(): string | undefined {
  return (
    process.env.STRIPE_WEBHOOK_SECRET?.trim() ||
    process.env.STRIPE_WEBHOOKS_SIGNING_SECRET?.trim()
  )
}

/**
 * Dispatch marketing Stripe webhook event
 *
 * Handles Stripe webhook events for marketing subscription changes.
 * Webhook types: customer.subscription.updated, customer.subscription.deleted, etc.
 */
export async function dispatchMarketingStripeEvent(
  event: Stripe.Event,
): Promise<void> {
  switch (event.type) {
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdate(subscription)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(subscription)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await handleInvoicePaymentSucceeded(invoice)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await handleInvoicePaymentFailed(invoice)
      break
    }

    default:
      console.log(`Unhandled Stripe webhook type: ${event.type}`)
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  const payloadUserId = subscription.metadata?.payloadUserId
  if (!payloadUserId) {
    console.warn('Subscription update without payloadUserId', subscription.id)
    return
  }
  console.log(`Subscription ${subscription.id} updated for user ${payloadUserId}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const payloadUserId = subscription.metadata?.payloadUserId
  if (!payloadUserId) {
    console.warn('Subscription deletion without payloadUserId', subscription.id)
    return
  }
  console.log(`Subscription ${subscription.id} deleted for user ${payloadUserId}`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer
  if (!customerId) {
    console.warn('Invoice payment succeeded without customer')
    return
  }
  console.log(`Invoice ${invoice.id} payment succeeded for customer ${customerId}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer
  if (!customerId) {
    console.warn('Invoice payment failed without customer')
    return
  }
  console.log(`Invoice ${invoice.id} payment failed for customer ${customerId}`)
}
