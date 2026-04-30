/**
 * Stripe API types — centralized from Stripe API with Payload extensions.
 *
 * Single source of truth for Stripe response shapes used across Cloud pages.
 * These match official Stripe API structures + project-specific extensions.
 *
 * Update when Stripe API changes; referenced by:
 * - src/app/(frontend)/(cloud)/cloud/_api/fetchSubscriptions.ts
 * - src/app/(frontend)/(cloud)/cloud/_api/fetchTeam.ts
 * - src/app/(frontend)/(cloud)/cloud/_api/fetchInvoices.ts
 */

import type { Project } from '@root/payload-cloud-types'

/** Stripe Subscription with Payload project extension. */
export interface StripeSubscription {
  default_payment_method: string
  id: string
  items: {
    data: Array<{
      id: string
      price: {
        currency: string
        id: string
        nickname: string
        product: string
        recurring: {
          interval: string
          interval_count: number
        }
        type: string
        unit_amount: number
      }
    }>
  }
  metadata: {
    payload_project_id: string
  }
  plan: {
    amount: number
    id: string
    nickname: string
  }
  /** Payload extension: project context. */
  project: Project
  status: string
  trial_end: number
}

/** Subscriptions list response from Stripe API. */
export interface StripeSubscriptionsResult {
  data: StripeSubscription[]
  has_more: boolean
}

/** Stripe Customer with Payload extensions. */
export interface StripeCustomer {
  deleted?: boolean
  id?: string
  invoice_settings?: {
    default_payment_method?:
      | {
          id?: string
        }
      | string
  }
}

/** Stripe Invoice line item (detailed). */
export interface StripeInvoiceLineItem {
  description?: string
  id: string
  period: {
    end: number
    start: number
  }
  plan: {
    id: string
  }
  price: {
    id: string
  }
}

/** Stripe Invoice as returned by Cloud API. */
export interface StripeInvoice {
  created: number
  hosted_invoice_url?: string
  id: string
  lines: {
    data: StripeInvoiceLineItem[]
    url?: string
  }
  status: string
  total: number
}

/** Invoices list response from Stripe API. */
export interface StripeInvoicesResult {
  data: StripeInvoice[]
  has_more: boolean
}

/** Type guard: validate Stripe Subscription at API boundary. */
export function isStripeSubscription(data: unknown): data is StripeSubscription {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'items' in data &&
    'status' in data &&
    Array.isArray((data as any).items?.data) &&
    'project' in data
  )
}

/** Type guard: validate Stripe Customer at API boundary. */
export function isStripeCustomer(data: unknown): data is StripeCustomer {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('id' in data || 'deleted' in data)
  )
}

/** Type guard: validate Stripe Invoice at API boundary. */
export function isStripeInvoice(data: unknown): data is StripeInvoice {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'created' in data &&
    'status' in data &&
    'total' in data &&
    'lines' in data &&
    Array.isArray((data as any).lines?.data)
  )
}

/** Helper: extract error message from Stripe API response. */
export function extractStripeError(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    return String((data as any).message)
  }
  return undefined
}
