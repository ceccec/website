import type { NextRequest } from 'next/server'

import {
  dispatchMarketingStripeEvent,
  getStripeServer,
  stripeWebhookSecret,
} from '@root/plugins/stripe'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Marketing Stripe webhook (`users` billing). If **`PAYLOAD_ECOMMERCE`** is on, the same handlers run on
 * `/api/payments/stripe/webhooks` via `stripeAdapter({ webhooks })`.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const stripe = getStripeServer()
  const secret = stripeWebhookSecret()

  if (!stripe || !secret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  let event: import('stripe').Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'constructEvent failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    await dispatchMarketingStripeEvent(event)
  } catch (err) {
    console.error('Stripe marketing webhook handler error', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
