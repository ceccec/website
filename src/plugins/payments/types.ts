/**
 * Payment Plugin Type Definitions
 *
 * Unified types for multi-provider payment processing.
 * Implementations: Stripe, Revolut, future providers.
 */

/**
 * Payment setup intent response (card validation)
 */
export interface SetupIntentResponse {
  id: string
  client_secret: string
  status: 'requires_payment_method' | 'processing' | 'succeeded'
}

/**
 * Payment method details
 */
export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  last4: string
  expMonth?: number
  expYear?: number
  brand?: string
}

/**
 * Payment confirmation result
 */
export interface PaymentResult {
  success: boolean
  paymentIntentId?: string
  error?: string
}

/**
 * Subscription response after creation
 */
export interface SubscriptionResponse {
  id: string
  externalId: string // Provider subscription ID (Stripe/Revolut)
  teamId: string
  planId: string
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  clientSecret?: string // For payment confirmation
}

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'succeeded'
  | 'canceled'

/**
 * Provider abstraction interface
 * Implementations handle Stripe, Revolut, etc.
 */
export interface PaymentProvider {
  /**
   * Create setup intent for card validation
   */
  createSetupIntent(teamId: string): Promise<SetupIntentResponse>

  /**
   * Confirm card setup (validate card)
   */
  confirmSetupIntent(clientSecret: string, paymentMethodId: string): Promise<PaymentResult>

  /**
   * Create subscription for team
   */
  createSubscription(
    teamId: string,
    planId: string,
    paymentMethodId?: string,
    options?: { freeTrial?: boolean }
  ): Promise<SubscriptionResponse>

  /**
   * Confirm payment for subscription
   */
  confirmPayment(clientSecret: string, paymentMethodId: string): Promise<PaymentResult>

  /**
   * Cancel subscription
   */
  cancelSubscription(subscriptionId: string): Promise<void>

  /**
   * Get subscription details
   */
  getSubscription(subscriptionId: string): Promise<SubscriptionResponse>

  /**
   * Set default payment method for customer
   */
  setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void>

  /**
   * Get invoices for customer
   */
  getInvoices(customerId: string): Promise<Array<{ id: string; total: number; dueDate: Date }>>
}

/**
 * Webhook event types all providers support
 */
export interface WebhookEvent {
  type: string
  data: Record<string, unknown>
  timestamp: Date
}

/**
 * Stripe-specific types
 */
export interface StripeEvent extends WebhookEvent {
  type:
    | 'customer.subscription.updated'
    | 'customer.subscription.deleted'
    | 'invoice.payment_succeeded'
    | 'invoice.payment_failed'
    | 'charge.dispute.created'
}

/**
 * Revolut-specific types
 */
export interface RevolutEvent extends WebhookEvent {
  type:
    | 'payment.link.completed'
    | 'payment.link.expired'
    | 'order.updated'
    | 'order.cancelled'
}

/**
 * Type guard: check if object is PaymentProvider
 */
export function isPaymentProvider(obj: unknown): obj is PaymentProvider {
  if (typeof obj !== 'object' || obj === null) return false
  const p = obj as Record<string, unknown>
  return (
    typeof p.createSetupIntent === 'function' &&
    typeof p.createSubscription === 'function' &&
    typeof p.confirmPayment === 'function'
  )
}

/**
 * Type guard: check if status is valid
 */
export function isValidSubscriptionStatus(status: unknown): status is SubscriptionStatus {
  const validStatuses: SubscriptionStatus[] = [
    'active',
    'past_due',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'succeeded',
    'canceled',
  ]
  return validStatuses.includes(status as SubscriptionStatus)
}
