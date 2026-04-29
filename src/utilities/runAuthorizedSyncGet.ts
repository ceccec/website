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
  await handler()
  return NextResponse.json({ success: true }, { status: 200 })
}
