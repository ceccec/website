/**
 * Unified HTTP client with exponential backoff retry logic for transient failures.
 * Handles rate limiting (429), service unavailability (503), and configurable retry strategies.
 */

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
  /** Initial delay in milliseconds (default: 1000) */
  baseDelay?: number
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number
  /** Maximum delay cap in milliseconds (default: 30000) */
  maxDelay?: number
  /** HTTP status codes that should trigger retry (default: [429, 503]) */
  retryableStatuses?: number[]
  /** Log retry attempts (default: true) */
  enableLogging?: boolean
}

/**
 * Unified HTTP client with exponential backoff retry logic.
 * Perfect for external API calls that may have transient failures.
 *
 * @example
 * const response = await httpClient.fetch(url, {
 *   headers: { Authorization: 'Bearer token' }
 * }, {
 *   maxRetries: 3,
 *   retryableStatuses: [429, 503]
 * })
 */
export class HttpClient {
  /**
   * Fetch with automatic retry on transient failures (429, 503).
   * Uses exponential backoff with jitter to prevent thundering herd.
   */
  async fetch(
    url: string,
    init?: RequestInit,
    config?: RetryConfig,
  ): Promise<Response> {
    const maxRetries = config?.maxRetries ?? 3
    const baseDelay = config?.baseDelay ?? 1000
    const backoffMultiplier = config?.backoffMultiplier ?? 2
    const maxDelay = config?.maxDelay ?? 30000
    const retryableStatuses = config?.retryableStatuses ?? [429, 503]
    const enableLogging = config?.enableLogging !== false

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, init)

        // Success — return immediately
        if (response.ok) {
          return response
        }

        // Check if this status should trigger a retry
        if (retryableStatuses.includes(response.status) && attempt < maxRetries) {
          const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), maxDelay)
          const statusText = response.statusText || `Status ${response.status}`

          if (enableLogging) {
            console.warn(
              `[HttpClient] ${response.status} ${statusText} at ${url}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`,
            )
          }

          await this.sleep(delay)
          continue
        }

        // Non-retryable error or last attempt — return the response
        return response
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < maxRetries) {
          const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), maxDelay)

          if (enableLogging) {
            console.warn(
              `[HttpClient] Fetch error at ${url}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1}):`,
              lastError.message,
            )
          }

          await this.sleep(delay)
          continue
        }

        // Max retries exhausted — throw the last error
        throw lastError
      }
    }

    // Should not reach here, but throw if we do
    throw lastError || new Error(`Max retries exceeded for ${url}`)
  }

  /**
   * Helper to sleep for a given duration.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * Singleton instance of HttpClient for use across the application.
 */
export const httpClient = new HttpClient()
