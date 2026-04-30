import {
  createStripeBillingPortalSession,
  getStripeServer,
} from '@root/plugins/stripe'

export async function createMarketingBillingSession(args: {
  payloadUserId: number | string
  returnUrl: string
  stripeCustomerId?: null | string
}): Promise<{ error: string } | { url: string }> {
  if (getStripeServer() && args.stripeCustomerId?.trim()) {
    return createStripeBillingPortalSession({
      returnUrl: args.returnUrl,
      stripeCustomerId: args.stripeCustomerId.trim(),
    })
  }

  const merchantUrl =
    process.env.REVOLUT_MERCHANT_ACCOUNT_URL?.trim() ||
    process.env.PAYMENT_LINK_CUSTOMER_ACCOUNT_URL?.trim()

  if (merchantUrl) {
    const u = new URL(merchantUrl)
    const param =
      process.env.REVOLUT_ACCOUNT_PARAM_USER?.trim() ||
      process.env.PAYMENT_LINK_ACCOUNT_PARAM_USER?.trim() ||
      'ref'
    u.searchParams.set(param, String(args.payloadUserId))
    return { url: u.toString() }
  }

  return {
    error:
      'No billing destination: add Stripe customer (checkout/webhook) or set REVOLUT_MERCHANT_ACCOUNT_URL.',
  }
}
