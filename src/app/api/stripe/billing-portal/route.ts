import type { NextRequest } from 'next/server'
import type { PayloadRequest } from 'payload'

import { createMarketingBillingSession } from '@root/plugins/site-billing/marketingBilling'
import { getPayload } from '@root/plugins/payload-runtime/getPayload'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/** Stripe Billing Portal or `REVOLUT_MERCHANT_ACCOUNT_URL` fallback. Body: `{ returnUrl }`. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { returnUrl?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const returnUrl = body.returnUrl
  if (typeof returnUrl !== 'string' || returnUrl.length === 0) {
    return NextResponse.json({ error: 'Expected returnUrl' }, { status: 400 })
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

  const customerId =
    fullUser && typeof fullUser === 'object' && 'stripeCustomerId' in fullUser
      ? (fullUser as { stripeCustomerId?: string }).stripeCustomerId
      : undefined

  const result = await createMarketingBillingSession({
    payloadUserId: user.id,
    returnUrl,
    stripeCustomerId: customerId,
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 503 })
  }

  return NextResponse.json({ url: result.url })
}
