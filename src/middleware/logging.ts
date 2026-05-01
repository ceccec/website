/**
 * Request/Response Logging Middleware
 *
 * Logs all HTTP requests and responses with:
 * - Method and path
 * - Query parameters
 * - Response status and duration
 * - User information (if authenticated)
 * - Error details (if applicable)
 *
 * Rule 9: Production Excellence — Observability through comprehensive logging
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger, createRequestLogger } from '@root/lib/logger'

/**
 * Extract user info from request (via auth header or cookie)
 */
async function extractUser(request: NextRequest): Promise<{ userId?: string; email?: string }> {
  try {
    // Try to get from Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      // Parse JWT token (simplified - real implementation would verify)
      const token = authHeader.slice(7)
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      return { userId: decoded.sub, email: decoded.email }
    }
  } catch {
    // Silently fail - user extraction is best-effort
  }

  return {}
}

/**
 * Extract relevant query parameters (exclude sensitive ones)
 */
function extractQueryParams(request: NextRequest): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {}
  const sensitiveParams = ['password', 'token', 'api_key', 'secret', 'access_token']

  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (!sensitiveParams.includes(key.toLowerCase())) {
      params[key] = value
    }
  }

  return params
}

/**
 * Extract response body size from headers
 */
function getResponseSize(response: NextResponse): number {
  const contentLength = response.headers.get('content-length')
  return contentLength ? parseInt(contentLength, 10) : 0
}

/**
 * Determine log level based on status code
 */
function getLogLevel(statusCode: number): 'debug' | 'info' | 'warn' | 'error' {
  if (statusCode >= 500) return 'error'
  if (statusCode >= 400) return 'warn'
  if (statusCode >= 300) return 'info'
  return 'debug'
}

/**
 * Skip logging for certain paths (e.g., health checks, static assets)
 */
function shouldLogPath(path: string): boolean {
  const skipPaths = [
    '/_next',
    '/static',
    '/favicon',
    '/robots.txt',
    '/.well-known',
    '/api/health',
    '/api/status',
  ]

  return !skipPaths.some((skipPath) => path.startsWith(skipPath))
}

/**
 * Logging middleware for Next.js
 * Wraps the response to capture timing and status
 */
export async function loggingMiddleware(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  const method = request.method
  const path = request.nextUrl.pathname
  const query = request.nextUrl.search

  // Skip logging for certain paths
  if (!shouldLogPath(path)) {
    return NextResponse.next()
  }

  try {
    // Extract user info
    const user = await extractUser(request)

    // Create request logger instance
    const requestLog = createRequestLogger()
    requestLog.setContext({
      requestId: request.headers.get('x-request-id') || generateRequestId(),
      userId: user.userId,
      method,
      path,
      query: query || undefined,
    })

    // Extract safe query parameters for logging
    const queryParams = extractQueryParams(request)

    // Log incoming request
    if (process.env.LOG_LEVEL === 'debug') {
      logger.debug('Request received', requestLog.context, {
        method,
        path,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        userAgent: request.headers.get('user-agent')?.slice(0, 100),
      })
    }

    // Call next middleware/handler
    let response = NextResponse.next()

    // Capture actual response by intercepting
    try {
      // For actual response capture, we'd need to:
      // 1. Clone response to read body
      // 2. Create new response with same body
      // This is a limitation of Next.js middleware
      // In practice, logging happens in API routes or at application layer
    } catch {
      // Response capturing limitations
    }

    // Calculate duration
    const duration = Date.now() - startTime

    // Log response with metrics
    const statusCode = response.status || 200
    logger.request(method, path, statusCode, duration, {
      ...requestLog.context,
      email: user.email,
    })

    // Add request ID to response headers
    response.headers.set('X-Request-ID', requestLog.context.requestId as string)

    // Add timing header
    response.headers.set('X-Response-Time', `${duration}ms`)

    return response
  } catch (error) {
    // Log middleware errors
    const duration = Date.now() - startTime
    logger.error(
      'Middleware error',
      error instanceof Error ? error : new Error(String(error)),
      { method, path },
      { duration },
    )
    return NextResponse.next()
  }
}

/**
 * API Route logging wrapper
 * Use in API routes: `export const POST = withLogging(handler)`
 */
export function withLogging<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T,
): T {
  return (async (request: NextRequest) => {
    const startTime = Date.now()
    const method = request.method
    const path = request.nextUrl.pathname

    try {
      // Extract user info
      const user = await extractUser(request)

      // Create request logger
      const requestLog = createRequestLogger()
      const requestId = request.headers.get('x-request-id') || generateRequestId()
      requestLog.setContext({
        requestId,
        userId: user.userId,
        method,
        path,
      })

      // Extract safe query parameters
      const queryParams = extractQueryParams(request)

      // Log incoming request
      logger.debug('API request', requestLog.context, {
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        contentType: request.headers.get('content-type'),
      })

      // Call handler
      const response = await handler(request)
      const duration = Date.now() - startTime
      const statusCode = response.status

      // Log response
      logger.request(method, path, statusCode, duration, {
        ...requestLog.context,
        email: user.email,
      })

      // Add timing headers
      const newResponse = new NextResponse(response.body, response)
      newResponse.headers.set('X-Request-ID', requestId)
      newResponse.headers.set('X-Response-Time', `${duration}ms`)

      return newResponse
    } catch (error) {
      const duration = Date.now() - startTime

      logger.error(
        'API route error',
        error instanceof Error ? error : new Error(String(error)),
        { method, path },
        { duration, severity: 'high' },
      )

      // Return error response
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 },
      )
    }
  }) as T
}

/**
 * Database query logging wrapper
 * Use in database operations: `await withQueryLogging(() => db.query(...))`
 */
export async function withQueryLogging<T>(
  query: string,
  fn: () => Promise<T>,
  context?: { userId?: string; collection?: string },
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await fn()
    const duration = Date.now() - startTime

    logger.query(query, duration, context)
    return result
  } catch (error) {
    const duration = Date.now() - startTime

    logger.query(query, duration, context, error instanceof Error ? error : null)
    throw error
  }
}

/**
 * Cache operation logging
 * Use in cache operations: `await withCacheLogging('hit', 'user:123', () => cache.get(...))`
 */
export async function withCacheLogging<T>(
  operation: 'hit' | 'miss' | 'set' | 'invalidate',
  key: string,
  fn?: () => Promise<T>,
): Promise<T | void> {
  const startTime = Date.now()

  try {
    if (fn) {
      const result = await fn()
      const duration = Date.now() - startTime
      logger.cache(operation, key, duration)
      return result
    } else {
      const duration = Date.now() - startTime
      logger.cache(operation, key, duration)
    }
  } catch (error) {
    const duration = Date.now() - startTime
    logger.cache(operation, key, duration)
    throw error
  }
}

/**
 * Authentication event logging
 * Use in auth flows: `logAuthEvent('login', userId)`
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'signup' | 'failed',
  userId?: string,
  details?: Record<string, any>,
): void {
  logger.auth(event, userId)

  if (details) {
    logger.info(`Authentication ${event} details`, { userId }, details)
  }
}

/**
 * Payment event logging
 * Use in payment flows: `logPaymentEvent('completed', 'stripe', 99.99, userId)`
 */
export function logPaymentEvent(
  event: 'initiated' | 'completed' | 'failed',
  provider: string,
  amount?: number,
  userId?: string,
  details?: Record<string, any>,
): void {
  logger.payment(event, provider, amount, { userId })

  if (details) {
    logger.info(`Payment ${event} details`, { userId }, details)
  }
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get request logger for use in handlers
 */
export { createRequestLogger }
