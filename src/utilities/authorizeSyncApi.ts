import type { NextRequest } from 'next/server'
import type { PayloadRequest } from 'payload'

import { getPayload } from '@root/lib/getPayload'
import { NextResponse } from 'next/server'

function syncSecret(): string | undefined {
  return process.env.CRON_SECRET?.trim() || process.env.NEXT_PRIVATE_CRON_KEY?.trim()
}

function authorizeSecret(req: NextRequest): boolean {
  const secret = syncSecret()
  if (!secret) {
    return false
  }
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${secret}`) {
    return true
  }
  return req.nextUrl.searchParams.get('secret') === secret
}

/**
 * Allows scheduled sync jobs (Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when
 * `CRON_SECRET` is set) or manual `?secret=` for non-Vercel hosts, or an authenticated admin session
 * (Payload admin UI buttons).
 */
export async function authorizeSyncApi(req: NextRequest): Promise<NextResponse | null> {
  if (authorizeSecret(req)) {
    return null
  }

  const payload = await getPayload()
  try {
    const { user } = await payload.auth({
      headers: req.headers,
      req: req as unknown as PayloadRequest,
    })
    if (user?.roles?.includes('admin')) {
      return null
    }
  } catch {
    // Deny below
  }

  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}
