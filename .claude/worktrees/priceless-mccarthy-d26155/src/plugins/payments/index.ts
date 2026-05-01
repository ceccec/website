/**
 * Payments Plugin
 *
 * Unified payment processing for multiple providers (Stripe, Revolut)
 * Consolidates: src/plugins/stripe/, src/plugins/revolut/, src/plugins/site-billing/
 *
 * Public API:
 * - getPaymentProvider() - get default provider
 * - createProvider(name) - create specific provider
 * - PaymentProvider interface - implement custom providers
 */

// Type exports
export type { PaymentProvider, SetupIntentResponse, SubscriptionResponse, PaymentResult } from './types'
export { isPaymentProvider, isValidSubscriptionStatus } from './types'

// Provider exports
export { getPaymentProvider, createProvider, getDefaultProvider, getAvailableProviders } from './providers/factory'
export { stripeProvider, mapStripeSubscriptionStatus } from './providers/stripe'
export { revolutProvider } from './providers/revolut'

/**
 * Default export: ready-to-use payment provider
 */
export { getPaymentProvider as default }
