import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'

import { authorizeSyncApi } from './authorizeSyncApi'

/**
 * Shared pattern for GET routes that run cron/admin-authorized sync work and return `{ success: true }`.
 */
export async function runAuthorizedSyncGet(
  req: NextRequest,
  handler: () => Promise<void>,
): Promise<NextResponse> {
  const denied = await authorizeSyncApi(req)
  if (denied) {
    return denied
  }

  try {
    await handler()
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Sync handler error:', message, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
