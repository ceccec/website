/**
 * Subscription Business Logic Service
 *
 * Handles all subscription lifecycle operations independent of payment provider.
 * Acts as bridge between UI and PaymentProvider implementation.
 */

import type { Payload } from 'payload'
import type { PaymentProvider, SubscriptionResponse } from '../types'
import { getPaymentProvider } from '../providers/factory'

/**
 * Create subscription for a team
 *
 * Flow:
 * 1. Call payment provider to create subscription
 * 2. Save to Payload CMS (source of truth)
 * 3. Return subscription details
 *
 * @param payload Payload CMS instance
 * @param teamId Team ID
 * @param planId Plan ID to subscribe to
 * @param paymentMethodId Optional payment method ID
 * @param options Additional options (freeTrial, etc.)
 */
export async function createSubscription(
  payload: Payload,
  teamId: string,
  planId: string,
  paymentMethodId?: string,
  options?: { freeTrial?: boolean }
): Promise<SubscriptionResponse> {
  const provider = getPaymentProvider()

  // Create subscription through payment provider
  const subscription = await provider.createSubscription(
    teamId,
    planId,
    paymentMethodId,
    options
  )

  // Save to Payload CMS as source of truth
  try {
    await payload.create({
      collection: 'subscriptions',
      data: {
        team: teamId,
        plan: planId,
        externalId: subscription.externalId,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        freeTrial: options?.freeTrial || false,
      },
    })
  } catch (err) {
    // Log error but don't fail - subscription may have been created
    console.error('Failed to save subscription to Payload CMS:', err)
  }

  return subscription
}

/**
 * Update subscription in Payload CMS and sync with provider
 *
 * @param payload Payload CMS instance
 * @param subscriptionId Subscription ID
 * @param updates Partial updates
 */
export async function updateSubscription(
  payload: Payload,
  subscriptionId: string,
  updates: Partial<SubscriptionResponse>
): Promise<SubscriptionResponse> {
  // Update in Payload CMS
  const updated = await payload.update({
    collection: 'subscriptions',
    id: subscriptionId,
    data: {
      status: updates.status,
      cancelAtPeriodEnd: updates.cancelAtPeriodEnd,
      currentPeriodEnd: updates.currentPeriodEnd?.toISOString(),
    },
  })

  return updated as unknown as SubscriptionResponse
}

/**
 * Cancel subscription
 *
 * @param payload Payload CMS instance
 * @param subscriptionId Subscription ID (external ID from provider)
 */
export async function cancelSubscription(
  payload: Payload,
  subscriptionId: string
): Promise<void> {
  const provider = getPaymentProvider()

  // Cancel through provider
  await provider.cancelSubscription(subscriptionId)

  // Update status in Payload CMS
  try {
    // Find subscription by external ID and update status
    const subscriptions = await payload.find({
      collection: 'subscriptions',
      where: {
        externalId: {
          equals: subscriptionId,
        },
      },
    })

    if (subscriptions.docs.length > 0) {
      const sub = subscriptions.docs[0]
      await payload.update({
        collection: 'subscriptions',
        id: sub.id,
        data: {
          status: 'canceled',
        },
      })
    }
  } catch (err) {
    console.error('Failed to update subscription status in Payload CMS:', err)
  }
}

/**
 * Get subscription details
 *
 * @param payload Payload CMS instance
 * @param subscriptionId Subscription ID
 */
export async function getSubscription(
  payload: Payload,
  subscriptionId: string
): Promise<SubscriptionResponse> {
  const provider = getPaymentProvider()
  return await provider.getSubscription(subscriptionId)
}

/**
 * Get team's current subscription
 *
 * @param payload Payload CMS instance
 * @param teamId Team ID
 */
export async function getTeamSubscription(payload: Payload, teamId: string): Promise<SubscriptionResponse | null> {
  try {
    const subscriptions = await payload.find({
      collection: 'subscriptions',
      where: {
        team: {
          equals: teamId,
        },
        status: {
          not_equals: 'canceled',
        },
      },
      limit: 1,
    })

    if (subscriptions.docs.length === 0) return null

    const sub = subscriptions.docs[0]
    return {
      id: sub.id,
      externalId: sub.externalId,
      teamId: sub.team,
      planId: sub.plan,
      status: sub.status,
      currentPeriodStart: new Date(sub.currentPeriodStart),
      currentPeriodEnd: new Date(sub.currentPeriodEnd),
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false,
    }
  } catch (err) {
    console.error('Failed to get team subscription:', err)
    return null
  }
}
