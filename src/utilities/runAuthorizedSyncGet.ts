import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'

import { ApiResponse } from './ApiResponse'
import { authService } from './AuthService'

/**
 * Shared pattern for GET routes that run cron/admin-authorized sync work.
 * Returns standardized ApiResponse envelope.
 *
 * @example
 * export async function GET(req: NextRequest): Promise<NextResponse> {
 *   return runAuthorizedSyncGet(req, () => syncToAlgolia())
 * }
 */
export async function runAuthorizedSyncGet(
  req: NextRequest,
  handler: () => Promise<void>,
): Promise<NextResponse> {
  const auth = await authService.authorizeSync(req)
  if (!auth.authorized) {
    return ApiResponse.unauthorized(auth.reason)
  }

  try {
    await handler()
    return ApiResponse.success({ message: 'Sync completed successfully' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[runAuthorizedSyncGet] Handler error:', message, error)
    return ApiResponse.serverError(message)
  }
}
