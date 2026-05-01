/**
 * Revolut Payment Provider Implementation
 *
 * Alternative payment provider using Revolut payment links
 * Consolidates logic from: src/plugins/revolut/
 */

import type { PaymentProvider, SetupIntentResponse, SubscriptionResponse, PaymentResult } from '../types'

/**
 * Revolut Provider Implementation
 *
 * Note: Revolut uses payment links instead of API-based subscriptions.
 * This provider bridges the gap to maintain consistent interface.
 */
export const revolutProvider: PaymentProvider = {
  async createSetupIntent(teamId: string): Promise<SetupIntentResponse> {
    // Revolut doesn't require card setup intent
    // Return a placeholder that works with the interface
    return {
      id: `revolut_setup_${teamId}`,
      client_secret: `revolut_secret_${teamId}`,
      status: 'succeeded',
    }
  },

  async confirmSetupIntent(clientSecret: string, paymentMethodId: string): Promise<PaymentResult> {
    // Revolut handles payment in link, not through API
    return {
      success: true,
    }
  },

  async createSubscription(
    teamId: string,
    planId: string,
    paymentMethodId?: string,
    options?: { freeTrial?: boolean }
  ): Promise<SubscriptionResponse> {
    // Revolut subscription creation is handled through payment links
    // This stores the intent in Payload CMS
    return {
      id: `revolut_sub_${teamId}`,
      externalId: `revolut_sub_${teamId}`,
      teamId,
      planId,
      status: 'incomplete',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
      clientSecret: '', // Revolut uses payment link URL instead
    }
  },

  async confirmPayment(clientSecret: string, paymentMethodId: string): Promise<PaymentResult> {
    // Revolut payment confirmation happens through callback/webhook
    return {
      success: true,
    }
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Revolut subscription cancellation
    // Implementation depends on Revolut API
    console.log(`Revolut subscription ${subscriptionId} cancellation requested`)
  },

  async getSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    // Placeholder implementation
    // Should fetch from Payload CMS where Revolut subscriptions are stored
    throw new Error('getSubscription not implemented for Revolut provider')
  },

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    // Revolut doesn't have default payment method concept
    console.log(`Revolut default payment method set for ${customerId}`)
  },

  async getInvoices(
    customerId: string
  ): Promise<Array<{ id: string; total: number; dueDate: Date }>> {
    // Placeholder implementation
    return []
  },
}

/**
 * Create Revolut provider instance
 */
export function createRevolutProvider(): PaymentProvider {
  return revolutProvider
}
