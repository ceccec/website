import type { RevolutCheckoutPlan } from './types'

import { resolveRevolutPaymentLinkBase } from './env'

export type BuildRevolutCheckoutUrlArgs = {
  cancelUrl: string
  email?: string
  payloadUserId: number | string
  plan: RevolutCheckoutPlan
  successUrl: string
}

function queryKey(primary: string, legacy: string, fallback: string): string {
  return (
    process.env[primary]?.trim() ||
    process.env[legacy]?.trim() ||
    fallback
  )
}

/**
 * Appends tracking / return URL query params to Revolut (or other PSP) **payment request** links from the dashboard.
 * Revolut may ignore unknown parameters — set `REVOLUT_LINK_APPEND_RETURN_URLS=false` if redirects break.
 */
export function buildRevolutCheckoutUrl(
  args: BuildRevolutCheckoutUrlArgs,
): { error: string } | { url: string } {
  const base = resolveRevolutPaymentLinkBase(args.plan)
  if (!base) {
    return {
      error: `No Revolut payment link URL for plan "${args.plan}" (set REVOLUT_PAYMENT_LINK_${args.plan.toUpperCase()} or PAYMENT_LINK_PLAN_${args.plan.toUpperCase()})`,
    }
  }

  let url: URL
  try {
    url = new URL(base)
  } catch {
    return { error: 'Invalid payment link URL in environment' }
  }

  const userKey = queryKey('REVOLUT_LINK_PARAM_USER', 'PAYMENT_LINK_PARAM_USER', 'payload_user_id')
  const planKey = queryKey('REVOLUT_LINK_PARAM_PLAN', 'PAYMENT_LINK_PARAM_PLAN', 'plan')
  url.searchParams.set(userKey, String(args.payloadUserId))
  url.searchParams.set(planKey, args.plan)

  const includeEmail =
    process.env.REVOLUT_LINK_INCLUDE_EMAIL === 'true' ||
    process.env.PAYMENT_LINK_INCLUDE_EMAIL === 'true'
  if (includeEmail && args.email?.trim()) {
    const emailKey = queryKey('REVOLUT_LINK_PARAM_EMAIL', 'PAYMENT_LINK_PARAM_EMAIL', 'email')
    url.searchParams.set(emailKey, args.email.trim())
  }

  const appendReturn =
    process.env.REVOLUT_LINK_APPEND_RETURN_URLS !== 'false' &&
    process.env.PAYMENT_LINK_APPEND_RETURN_URLS !== 'false'

  if (appendReturn) {
    const successKey = queryKey(
      'REVOLUT_LINK_PARAM_SUCCESS',
      'PAYMENT_LINK_PARAM_SUCCESS',
      'success_url',
    )
    const cancelKey = queryKey(
      'REVOLUT_LINK_PARAM_CANCEL',
      'PAYMENT_LINK_PARAM_CANCEL',
      'cancel_url',
    )
    url.searchParams.set(successKey, args.successUrl)
    url.searchParams.set(cancelKey, args.cancelUrl)
  }

  return { url: url.toString() }
}
