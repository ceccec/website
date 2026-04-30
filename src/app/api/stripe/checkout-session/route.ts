import type { NextRequest } from 'next/server'
import type { PayloadRequest } from 'payload'

import { createMarketingCheckout } from '@root/plugins/site-billing/marketingCheckout'
import { getPayload } from '@root/plugins/payload-runtime/getPayload'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Starts checkout — Stripe (`priceId`) or Revolut payment links (`plan` or mapped `priceId`).
 * Body: `{ priceId?, plan?, successUrl, cancelUrl }` — authenticated Payload user required.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: {
    cancelUrl?: string
    plan?: 'enterprise' | 'pro' | 'starter'
    priceId?: string
    successUrl?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { cancelUrl, plan, priceId, successUrl } = body
  if (typeof successUrl !== 'string' || typeof cancelUrl !== 'string') {
    return NextResponse.json(
      { error: 'Expected successUrl and cancelUrl (strings)' },
      { status: 400 },
    )
  }

  if (typeof priceId !== 'string' && typeof plan !== 'string') {
    return NextResponse.json(
      { error: 'Provide priceId (Stripe) and/or plan (revolut: starter|pro|enterprise)' },
      { status: 400 },
    )
  }

  const payload = await getPayload()
  const { user } = await payload.auth({
    headers: req.headers,
    req: req as unknown as PayloadRequest,
  })

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const fullUser = await payload.findByID({
    id: user.id,
    collection: 'users',
    depth: 0,
    overrideAccess: true,
  })
  const existingStripeCustomerId =
    fullUser && typeof fullUser === 'object' && 'stripeCustomerId' in fullUser
      ? (fullUser as { stripeCustomerId?: string }).stripeCustomerId
      : undefined

  const email =
    fullUser && typeof fullUser === 'object' && 'email' in fullUser
      ? String((fullUser as { email?: string }).email ?? '')
      : undefined

  const result = await createMarketingCheckout({
    cancelUrl,
    existingStripeCustomerId,
    payloadUserId: user.id,
    plan,
    priceId,
    successUrl,
    userEmail: email || undefined,
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ provider: result.provider, url: result.url })
}
