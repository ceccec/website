/**
 * Payment Provider Factory
 *
 * Creates and configures payment providers based on environment
 * Supports: Stripe (default), Revolut (alternative)
 */

import type { PaymentProvider } from '../types'
import { createStripeProvider } from './stripe'
import { createRevolutProvider } from './revolut'

/**
 * Payment provider selection enum
 */
export enum ProviderName {
  STRIPE = 'stripe',
  REVOLUT = 'revolut',
}

/**
 * Create payment provider instance
 *
 * Selection logic:
 * 1. Use PAYMENT_PROVIDER env var if set
 * 2. Fall back to Stripe (default)
 *
 * @param name Provider name (stripe | revolut)
 * @returns PaymentProvider instance
 */
export function createProvider(name: ProviderName | string): PaymentProvider {
  switch (name.toLowerCase()) {
    case ProviderName.STRIPE:
      return createStripeProvider()

    case ProviderName.REVOLUT:
      return createRevolutProvider()

    default:
      throw new Error(`Unknown payment provider: ${name}. Supported: stripe, revolut`)
  }
}

/**
 * Get default payment provider based on environment
 *
 * Priority:
 * 1. NEXT_PUBLIC_PAYMENT_PROVIDER env var (if set)
 * 2. PAYMENT_PROVIDER env var
 * 3. Stripe (default fallback)
 */
export function getDefaultProvider(): PaymentProvider {
  const providerName =
    process.env.PAYMENT_PROVIDER ||
    process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ||
    ProviderName.STRIPE

  return createProvider(providerName)
}

/**
 * Validate provider is available (has required environment variables)
 *
 * @param name Provider name
 * @returns true if provider can be initialized
 */
export function isProviderAvailable(name: ProviderName | string): boolean {
  try {
    const provider = createProvider(name)
    return !!provider
  } catch {
    return false
  }
}

/**
 * Get all available providers
 *
 * @returns List of provider names that can be initialized
 */
export function getAvailableProviders(): ProviderName[] {
  return Object.values(ProviderName).filter((name) => isProviderAvailable(name))
}

/**
 * Singleton instance of default provider
 * Lazy-loaded on first access
 */
let defaultProviderInstance: PaymentProvider | null = null

export function getPaymentProvider(): PaymentProvider {
  if (!defaultProviderInstance) {
    defaultProviderInstance = getDefaultProvider()
  }
  return defaultProviderInstance
}

/**
 * Clear singleton (mainly for testing)
 */
export function clearPaymentProvider(): void {
  defaultProviderInstance = null
}
