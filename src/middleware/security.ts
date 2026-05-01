/**
 * Security Middleware
 *
 * Implements:
 * - CORS validation
 * - Security headers (CSP, X-Frame-Options, etc.)
 * - Rate limiting
 * - Request validation
 *
 * Rule 9: Production Excellence — Security is non-negotiable
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@root/lib/logger'

/**
 * Allowed origins for CORS
 * In production, should be configurable per environment
 */
function getAllowedOrigins(): string[] {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const allowedOrigins = [baseUrl]

  // Add development origins
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000')
  }

  // Add additional configured origins
  if (process.env.ALLOWED_ORIGINS) {
    const extras = process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    allowedOrigins.push(...extras)
  }

  return allowedOrigins
}

/**
 * Security headers configuration
 */
const SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking
  'X-Frame-Options': 'SAMEORIGIN',

  // Enable XSS protection
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',

  // HSTS: Force HTTPS for 1 year
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',

  // Content Security Policy (strict)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Relaxed for Next.js; should be tightened
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
}

/**
 * Rate limiting store (in-memory; use Redis in production)
 */
class RateLimiter {
  private requests = new Map<string, number[]>()
  private maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  private windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10) // 1 minute

  isAllowed(key: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get requests in the time window
    const requests = this.requests.get(key) || []
    const recentRequests = requests.filter((t) => t > windowStart)

    // Update the store
    this.requests.set(key, recentRequests)

    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return false
    }

    // Add current request
    recentRequests.push(now)
    this.requests.set(key, recentRequests)

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup()
    }

    return true
  }

  private cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.windowMs * 2

    for (const [key, requests] of this.requests.entries()) {
      const recent = requests.filter((t) => t > windowStart)
      if (recent.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, recent)
      }
    }
  }
}

const rateLimiter = new RateLimiter()

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const direct = request.headers.get('x-real-ip')

  return (forwarded?.split(',')[0].trim() || direct || 'unknown').slice(0, 50) // Limit length
}

/**
 * Apply security middleware to request
 */
export function withSecurity(request: NextRequest): NextResponse | null {
  const response = NextResponse.next()

  // Add security headers
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value)
  }

  // Add request ID for tracking
  const requestId = request.headers.get('x-request-id') || generateRequestId()
  response.headers.set('X-Request-ID', requestId)

  return response
}

/**
 * Validate CORS request
 */
export function validateCors(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin')
  if (!origin) return null // No CORS needed for same-origin requests

  const allowedOrigins = getAllowedOrigins()

  if (!allowedOrigins.includes(origin)) {
    logger.warn('CORS origin rejected', { origin })
    return new NextResponse('CORS not allowed', { status: 403 })
  }

  const response = new NextResponse()
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Request-ID',
  )
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}

/**
 * Apply rate limiting to request
 */
export function applyRateLimit(request: NextRequest): NextResponse | null {
  // Skip rate limiting for certain endpoints
  const path = request.nextUrl.pathname
  const bypassPaths = ['/api/health', '/api/status', '/.well-known']
  if (bypassPaths.some((p) => path.startsWith(p))) {
    return null
  }

  const clientIp = getClientIp(request)
  const key = `${clientIp}:${path}`

  if (!rateLimiter.isAllowed(key)) {
    logger.warn('Rate limit exceeded', { clientIp, path })
    return new NextResponse('Too many requests', { status: 429 })
  }

  return null
}

/**
 * Validate content type for POST/PUT requests
 */
export function validateContentType(request: NextRequest): NextResponse | null {
  const method = request.method
  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return null // Only validate for mutation requests
  }

  const contentType = request.headers.get('content-type')
  if (!contentType) {
    logger.warn('Missing content-type header', { method, path: request.nextUrl.pathname })
    return new NextResponse('Content-Type header required', { status: 400 })
  }

  // Check for allowed content types
  const allowedTypes = ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded']
  const isAllowed = allowedTypes.some((type) => contentType.includes(type))

  if (!isAllowed) {
    logger.warn('Invalid content-type', { contentType, method, path: request.nextUrl.pathname })
    return new NextResponse(`Invalid Content-Type: ${contentType}`, { status: 415 })
  }

  return null
}

/**
 * Validate request headers for common attacks
 */
export function validateHeaders(request: NextRequest): NextResponse | null {
  // Check for suspicious headers
  const suspiciousPatterns = [
    { header: 'user-agent', pattern: /bot|crawler|scraper/i },
  ]

  for (const { header, pattern } of suspiciousPatterns) {
    const value = request.headers.get(header)
    if (value && pattern.test(value)) {
      logger.debug('Suspicious header detected', { header, value: value.slice(0, 100) })
      // Log but don't block - legitimate crawlers should be allowed
    }
  }

  return null
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Compose all security middleware checks
 */
export function composeSecurityMiddleware(request: NextRequest): NextResponse | null {
  // Check rate limiting first
  let response = applyRateLimit(request)
  if (response) return response

  // Validate CORS
  if (request.method === 'OPTIONS') {
    response = validateCors(request)
    if (response) return response
  }

  // Validate content type for mutations
  response = validateContentType(request)
  if (response) return response

  // Validate headers
  response = validateHeaders(request)
  if (response) return response

  // Apply security headers
  response = withSecurity(request)
  return response
}

/**
 * Middleware function for Next.js
 * Add to middleware.ts: export { securityMiddleware as middleware }
 */
export function securityMiddleware(request: NextRequest): NextResponse {
  return composeSecurityMiddleware(request) || NextResponse.next()
}
