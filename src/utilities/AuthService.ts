import type { NextRequest } from 'next/server'
import type { PayloadRequest } from 'payload'

import { getPayload } from '@root/lib/getPayload'
import { resolveFirstEnvValue } from '@root/lib/resolveGlobalField'

/**
 * Result of an authorization check across different schemes (cron secret, admin session, cloud token).
 */
export interface AuthResult {
  /** Whether the request is authorized */
  authorized: boolean
  /** The authenticated user, if applicable */
  user?: { id: string; roles?: string[] }
  /** Reason for denial, if unauthorized */
  reason?: string
}

/**
 * Unified authorization service supporting multiple auth schemes:
 * - Cron secret (Bearer token or query param)
 * - Admin session (Payload CMS)
 * - Cloud JWT token (from cookies)
 */
export class AuthService {
  /**
   * Get the sync secret from environment variables.
   * Tries CRON_SECRET first, falls back to NEXT_PRIVATE_CRON_KEY.
   */
  private getSyncSecret(): string | null {
    return resolveFirstEnvValue(
      process.env.CRON_SECRET,
      process.env.NEXT_PRIVATE_CRON_KEY,
    ) || null
  }

  /**
   * Check if the request includes a valid cron/sync secret.
   * Accepts Bearer token in Authorization header or ?secret query parameter.
   */
  private authorizeCronSecret(req: NextRequest): boolean {
    const secret = this.getSyncSecret()
    if (!secret) {
      return false
    }

    // Check Authorization header
    const auth = req.headers.get('authorization')
    if (auth === `Bearer ${secret}`) {
      return true
    }

    // Check query parameter
    return req.nextUrl.searchParams.get('secret') === secret
  }

  /**
   * Authorize a request with a cron/sync secret or admin session.
   * Used for scheduled sync jobs and manual API triggers.
   *
   * @example
   * const auth = await authService.authorizeSync(req)
   * if (!auth.authorized) {
   *   return ApiResponse.unauthorized(auth.reason)
   * }
   */
  async authorizeSync(req: NextRequest): Promise<AuthResult> {
    // Try cron secret first
    if (this.authorizeCronSecret(req)) {
      return { authorized: true }
    }

    // Try admin session
    const payload = await getPayload()
    try {
      const { user } = await payload.auth({
        headers: req.headers,
        req: req as unknown as PayloadRequest,
      })

      if (user?.roles?.includes('admin')) {
        return { authorized: true, user: { id: user.id as string, roles: user.roles } }
      }
    } catch {
      // Not authenticated — fall through to denial below
    }

    return { authorized: false, reason: 'Invalid or missing credentials' }
  }

  /**
   * Authorize a request with a specific sync secret from environment.
   * More restrictive than authorizeSync — only checks the env var, no admin fallback.
   *
   * @param req - The NextRequest to authorize
   * @param envKey - The environment variable key (e.g., 'NEXT_PRIVATE_REVALIDATION_KEY')
   *
   * @example
   * const auth = authService.authorizeSyncSecret(req, 'NEXT_PRIVATE_REVALIDATION_KEY')
   * if (!auth.authorized) return ApiResponse.unauthorized()
   */
  authorizeSyncSecret(req: NextRequest, envKey: string): AuthResult {
    const secret = process.env[envKey]

    if (!secret) {
      return { authorized: false, reason: 'No secret configured' }
    }

    // Check Authorization header
    const auth = req.headers.get('authorization')
    if (auth === `Bearer ${secret}`) {
      return { authorized: true }
    }

    // Check query parameter
    if (req.nextUrl.searchParams.get('secret') === secret) {
      return { authorized: true }
    }

    return { authorized: false, reason: 'Invalid secret' }
  }
}

/**
 * Singleton instance of AuthService for use across the application.
 */
export const authService = new AuthService()
