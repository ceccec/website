/**
 * Marketing Stripe integration — server client, Checkout / Billing Portal, webhooks → `users` billing.
 * Colocated per [Payload plugins](https://payloadcms.com/docs/plugins/plugin-api) integration guidance.
 */
export { getStripeServer, stripeWebhookSecret } from './server'
export {
  createStripeBillingPortalSession,
  createStripeSubscriptionCheckoutSession,
  type CreateStripeBillingPortalArgs,
  type CreateStripeCheckoutSessionArgs,
} from './subscriptionCheckout'
export {
  dispatchMarketingStripeEvent,
  mapStripeSubscriptionStatus,
  marketingStripeWebhookHandler,
  marketingStripeWebhookHandlers,
  normalizePlanTier,
} from './marketingSubscriptionSync'
