import type { RevolutCheckoutPlan } from './types'

/**
 * Map Stripe Price ids from your UI to a plan tier when using Revolut links instead of Stripe Checkout.
 * `REVOLUT_PRICE_ID_TO_PLAN` or legacy `PAYMENT_PRICE_ID_TO_PLAN` — JSON object `{"price_xxx":"starter"}`.
 */
export function mapPriceIdToRevolutPlan(priceId: string): null | RevolutCheckoutPlan {
  const raw =
    process.env.REVOLUT_PRICE_ID_TO_PLAN?.trim() || process.env.PAYMENT_PRICE_ID_TO_PLAN?.trim()
  if (!raw) {
    return null
  }
  try {
    const map = JSON.parse(raw) as Record<string, string>
    const v = map[priceId]?.toLowerCase()
    if (v === 'starter' || v === 'pro' || v === 'enterprise') {
      return v
    }
  } catch {
    return null
  }
  return null
}
