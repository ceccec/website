/**
 * Payment Method Service
 *
 * Manages payment methods for teams and customers
 */

import type { Payload } from 'payload'
import { getPaymentProvider } from '../providers/factory'

/**
 * Set default payment method for team
 *
 * @param payload Payload CMS instance
 * @param teamId Team ID (Stripe customer ID)
 * @param paymentMethodId Payment method ID from Stripe
 */
export async function setDefaultPaymentMethod(
  payload: Payload,
  teamId: string,
  paymentMethodId: string
): Promise<void> {
  const provider = getPaymentProvider()

  try {
    await provider.setDefaultPaymentMethod(teamId, paymentMethodId)

    // Update in Payload CMS
    try {
      await payload.update({
        collection: 'teams',
        id: teamId,
        data: {
          defaultPaymentMethod: paymentMethodId,
        },
      })
    } catch (err) {
      console.error('Failed to save default payment method to Payload CMS:', err)
    }
  } catch (err) {
    throw new Error(`Failed to set default payment method: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/**
 * Check if team has default payment method set
 *
 * @param payload Payload CMS instance
 * @param teamId Team ID
 */
export async function hasDefaultPaymentMethod(payload: Payload, teamId: string): Promise<boolean> {
  try {
    const team = await payload.findByID({
      collection: 'teams',
      id: teamId,
    })

    return !!team.defaultPaymentMethod
  } catch (err) {
    console.error('Failed to check default payment method:', err)
    return false
  }
}

/**
 * Get team's default payment method ID
 *
 * @param payload Payload CMS instance
 * @param teamId Team ID
 */
export async function getDefaultPaymentMethod(payload: Payload, teamId: string): Promise<string | null> {
  try {
    const team = await payload.findByID({
      collection: 'teams',
      id: teamId,
    })

    return team.defaultPaymentMethod || null
  } catch (err) {
    console.error('Failed to get default payment method:', err)
    return null
  }
}

/**
 * Clear default payment method
 *
 * @param payload Payload CMS instance
 * @param teamId Team ID
 */
export async function clearDefaultPaymentMethod(payload: Payload, teamId: string): Promise<void> {
  try {
    await payload.update({
      collection: 'teams',
      id: teamId,
      data: {
        defaultPaymentMethod: null,
      },
    })
  } catch (err) {
    console.error('Failed to clear default payment method:', err)
  }
}
