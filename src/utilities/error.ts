/**
 * Error normalization utilities
 *
 * Consolidates error handling to replace 50+ scattered `catch (e: any)` blocks.
 * Ensures all caught exceptions are properly typed as Error objects for logging & display.
 */

/**
 * Normalizes any caught value to an Error object
 * Handles: Error, string, unknown, null, undefined
 *
 * Usage:
 * ```typescript
 * try {
 *   await riskyOperation()
 * } catch (err: unknown) {
 *   const error = normalizeError(err)
 *   console.error(error.message)
 * }
 * ```
 */
export function normalizeError(err: unknown): Error {
  // Already an Error object
  if (err instanceof Error) {
    return err
  }

  // String error
  if (typeof err === 'string') {
    return new Error(err)
  }

  // Object with message property (like Stripe errors)
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = String((err as Record<string, unknown>).message)
    return new Error(message)
  }

  // Fallback: convert to string
  return new Error(String(err))
}

/**
 * Extract error message safely
 * Returns user-friendly message or generic fallback
 */
export function getErrorMessage(err: unknown): string {
  const normalized = normalizeError(err)
  return normalized.message || 'An unexpected error occurred'
}

/**
 * Log error with full context (used in server-only functions)
 * Preserves original error for debugging while providing safe message to users
 */
export function logError(err: unknown, context?: string): Error {
  const error = normalizeError(err)
  const prefix = context ? `[${context}] ` : ''
  console.error(`${prefix}${error.message}`, error)
  return error
}
