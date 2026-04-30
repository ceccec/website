import type { RevolutCheckoutPlan } from './types'

/** Prefer `REVOLUT_PAYMENT_LINK_*`; legacy `PAYMENT_LINK_PLAN_*` still supported. */
const PLAN_BASE_URL_KEYS: Record<RevolutCheckoutPlan, readonly [string, string]> = {
  starter: ['REVOLUT_PAYMENT_LINK_STARTER', 'PAYMENT_LINK_PLAN_STARTER'],
  pro: ['REVOLUT_PAYMENT_LINK_PRO', 'PAYMENT_LINK_PLAN_PRO'],
  enterprise: ['REVOLUT_PAYMENT_LINK_ENTERPRISE', 'PAYMENT_LINK_PLAN_ENTERPRISE'],
}

function firstEnv(...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k]?.trim()
    if (v) {
      return v
    }
  }
  return undefined
}

export function resolveRevolutPaymentLinkBase(plan: RevolutCheckoutPlan): string | undefined {
  const keys = PLAN_BASE_URL_KEYS[plan]
  return firstEnv(keys[0], keys[1])
}

/** True when any per-plan payment link base URL is set (Revolut Business links or generic HTTPS URLs). */
export function isRevolutCheckoutConfigured(): boolean {
  return (
    Boolean(resolveRevolutPaymentLinkBase('starter')) ||
    Boolean(resolveRevolutPaymentLinkBase('pro')) ||
    Boolean(resolveRevolutPaymentLinkBase('enterprise'))
  )
}
