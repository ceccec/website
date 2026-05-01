import type { Access } from 'payload'

export type SubscriptionStatus = 'active' | 'canceled' | 'inactive' | 'past_due'

/** Sync from Stripe (webhook / Price `metadata.plan_tier`) — rank drives content access. */
export const SUBSCRIPTION_PLANS = ['none', 'starter', 'pro', 'enterprise'] as const
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number]

/**
 * Content gates — higher tiers require a subscription plan at or above that rank
 * ({@link subscriptionPlanRank}). **`subscriber`** means any paid plan (same minimum rank as **starter**).
 */
export const CONTENT_ACCESS_TIERS = ['public', 'subscriber', 'starter', 'pro', 'enterprise'] as const
export type ContentAccessTier = (typeof CONTENT_ACCESS_TIERS)[number]

/** Numeric rank for a user's **subscriptionPlan** (not subscription status). */
export function subscriptionPlanRank(plan: null | string | undefined): number {
  switch (plan) {
    case 'enterprise':
      return 3
    case 'pro':
      return 2
    case 'starter':
      return 1
    default:
      return 0
  }
}

/** Minimum plan rank required to read a document with this **accessTier** (published). */
export function requiredRankForContentTier(tier: null | string | undefined): number {
  switch (tier) {
    case 'enterprise':
      return 3
    case 'pro':
      return 2
    case 'public':
      return 0
    case 'starter':
    case 'subscriber':
      return 1
    default:
      return 0
  }
}

/** All **accessTier** values the visitor may read given their entitlement rank (0 = anonymous / no plan). */
export function allowedContentTiersForRank(rank: number): ContentAccessTier[] {
  return CONTENT_ACCESS_TIERS.filter((t) => requiredRankForContentTier(t) <= rank)
}

/** Narrow billing shape for entitlement checks (matches `users` collection fields). */
export type SubscriberFields = {
  subscriptionCurrentPeriodEnd?: Date | null | string
  subscriptionPlan?: null | string
  subscriptionStatus?: null | string | SubscriptionStatus
}

export function subscriptionPeriodStillValid(user: null | SubscriberFields | undefined): boolean {
  const end = user?.subscriptionCurrentPeriodEnd
  if (end == null || end === '') {
    return true
  }
  const t = typeof end === 'string' ? Date.parse(end) : end instanceof Date ? end.getTime() : NaN
  if (Number.isNaN(t)) {
    return true
  }
  return t > Date.now()
}

/**
 * Active paying subscriber: correct **subscriptionStatus**, period not expired, and a non-**none** plan.
 */
export function isActiveSubscriber(user: null | SubscriberFields | undefined): boolean {
  if (!user || user.subscriptionStatus !== 'active') {
    return false
  }
  if (!subscriptionPeriodStillValid(user)) {
    return false
  }
  return subscriptionPlanRank(user.subscriptionPlan) >= 1
}

/** Effective entitlement rank (0–3) for list/query access — combines status, period, and plan. */
export function userEntitlementRank(user: null | SubscriberFields | undefined): number {
  if (!user || user.subscriptionStatus !== 'active') {
    return 0
  }
  if (!subscriptionPeriodStillValid(user)) {
    return 0
  }
  return subscriptionPlanRank(user.subscriptionPlan)
}

/**
 * Published posts/pages: **public** for everyone; paid tiers use {@link userEntitlementRank} vs
 * **accessTier**. Admins see all (including drafts via existing draft flows).
 */
export const readPublishedOrSubscriberAccess: Access = ({ req }) => {
  if (req.user?.roles?.includes('admin')) {
    return true
  }

  const basePublished = {
    _status: {
      equals: 'published' as const,
    },
  }

  const rank = userEntitlementRank(req.user as SubscriberFields | undefined)
  const allowed = allowedContentTiersForRank(rank)

  return {
    and: [
      basePublished,
      {
        or: [
          { accessTier: { in: allowed } },
          { accessTier: { exists: false } },
        ],
      },
    ],
  }
}

/** Non–subscriber-only media is public; **subscriberOnly** requires any paid plan ({@link isActiveSubscriber}). */
export const mediaSubscriberReadAccess: Access = ({ req }) => {
  if (req.user?.roles?.includes('admin')) {
    return true
  }
  if (isActiveSubscriber(req.user as SubscriberFields | undefined)) {
    return true
  }
  return {
    or: [{ subscriberOnly: { equals: false } }, { subscriberOnly: { exists: false } }],
  }
}
