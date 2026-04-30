import {
  buildRevolutCheckoutUrl,
  isRevolutCheckoutConfigured,
  mapPriceIdToRevolutPlan,
} from '@root/plugins/revolut'
import {
  createStripeSubscriptionCheckoutSession,
  getStripeServer,
} from '@root/plugins/stripe'
import type { RevolutCheckoutPlan } from '@root/plugins/revolut/types'

export type MarketingCheckoutProvider = 'none' | 'revolut' | 'stripe'

export type MarketingCheckoutArgs = {
  cancelUrl: string
  existingStripeCustomerId?: null | string
  payloadUserId: number | string
  priceId?: string
  plan?: RevolutCheckoutPlan
  successUrl: string
  userEmail?: string
}

export type MarketingCheckoutResult =
  | { error: string }
  | { provider: 'revolut'; url: string }
  | { provider: 'stripe'; url: string }

export function resolveMarketingCheckoutProvider(): MarketingCheckoutProvider {
  if (process.env.STRIPE_SECRET_KEY?.trim()) {
    return 'stripe'
  }
  if (isRevolutCheckoutConfigured()) {
    return 'revolut'
  }
  return 'none'
}

export async function createMarketingCheckout(
  args: MarketingCheckoutArgs,
): Promise<MarketingCheckoutResult> {
  const provider = resolveMarketingCheckoutProvider()

  if (provider === 'stripe') {
    if (!args.priceId?.trim()) {
      return { error: 'Stripe checkout requires priceId (Stripe Price id).' }
    }
    const result = await createStripeSubscriptionCheckoutSession({
      cancelUrl: args.cancelUrl,
      existingStripeCustomerId: args.existingStripeCustomerId,
      payloadUserId: args.payloadUserId,
      priceId: args.priceId.trim(),
      successUrl: args.successUrl,
    })
    if ('error' in result) {
      return result
    }
    return { provider: 'stripe', url: result.url }
  }

  if (provider === 'revolut') {
    let plan = args.plan ?? null
    if (!plan && args.priceId?.trim()) {
      plan = mapPriceIdToRevolutPlan(args.priceId.trim())
    }
    if (!plan) {
      return {
        error:
          'Revolut checkout requires plan (starter|pro|enterprise) or priceId mapped in REVOLUT_PRICE_ID_TO_PLAN.',
      }
    }
    const result = buildRevolutCheckoutUrl({
      cancelUrl: args.cancelUrl,
      email: args.userEmail,
      payloadUserId: args.payloadUserId,
      plan,
      successUrl: args.successUrl,
    })
    if ('error' in result) {
      return result
    }
    return { provider: 'revolut', url: result.url }
  }

  return {
    error:
      'No checkout configured: set STRIPE_SECRET_KEY or Revolut payment link URLs (REVOLUT_PAYMENT_LINK_*).',
  }
}

export function isStripeMarketingConfigured(): boolean {
  return Boolean(getStripeServer())
}
