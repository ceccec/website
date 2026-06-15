'use server'

/**
 * Payment Server Actions
 *
 * Replace HTTP API calls for payment operations.
 * Replaces: fetch('/api/stripe/setup-intent'), fetch('/api/subscriptions'), etc.
 *
 * Usage:
 * ```typescript
 * const intent = await createSetupIntentAction(teamId)
 * const subscription = await createSubscriptionAction(teamId, planId)
 * ```
 */

import { getPayload } from '@root/plugins/payload-runtime/getPayload'
import type { SetupIntentResponse, SubscriptionResponse } from '@root/plugins/payments'
import { getPaymentProvider } from '@root/plugins/payments'
import {
  createSubscription,
  getTeamSubscription,
  cancelSubscription as cancelSubscriptionService,
} from '@root/plugins/payments/services/subscriptionService'
import {
  setDefaultPaymentMethod,
  hasDefaultPaymentMethod,
} from '@root/plugins/payments/services/paymentMethodService'

/**
 * Create setup intent for card validation
 *
 * Replaces: POST /api/stripe/setup-intent
 */
export async function createSetupIntentAction(teamId: string): Promise<SetupIntentResponse> {
  try {
    const provider = getPaymentProvider()
    return await provider.createSetupIntent(teamId)
  } catch (error) {
    throw new Error(`Failed to create setup intent: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Create subscription for team
 *
 * Replaces: POST /api/subscriptions
 */
export async function createSubscriptionAction(
  teamId: string,
  planId: string,
  paymentMethodId?: string,
  options?: { freeTrial?: boolean }
): Promise<SubscriptionResponse> {
  try {
    const payload = await getPayload()

    return await createSubscription(payload, teamId, planId, paymentMethodId, options)
  } catch (error) {
    throw new Error(`Failed to create subscription: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Update team's default payment method
 *
 * Replaces: POST /api/customers (updateCustomer)
 */
export async function updatePaymentMethodAction(
  teamId: string,
  paymentMethodId: string
): Promise<void> {
  try {
    const payload = await getPayload()

    // Check if team already has default method
    const hasDefault = await hasDefaultPaymentMethod(payload, teamId)

    if (!hasDefault) {
      await setDefaultPaymentMethod(payload, teamId, paymentMethodId)
    }
  } catch (error) {
    throw new Error(`Failed to update payment method: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Get team's current subscription
 *
 * New action - enables type-safe subscription lookup
 */
export async function getTeamSubscriptionAction(teamId: string): Promise<SubscriptionResponse | null> {
  try {
    const payload = await getPayload()
    return await getTeamSubscription(payload, teamId)
  } catch (error) {
    console.error('Failed to get team subscription:', error)
    return null
  }
}

/**
 * Cancel team's subscription
 *
 * New action - replaces scattered cancellation logic
 */
export async function cancelSubscriptionAction(subscriptionId: string): Promise<void> {
  try {
    const payload = await getPayload()
    await cancelSubscriptionService(payload, subscriptionId)
  } catch (error) {
    throw new Error(`Failed to cancel subscription: ${error instanceof Error ? error.message : String(error)}`)
  }
}
