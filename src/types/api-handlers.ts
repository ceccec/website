/**
 * API Handler Types
 *
 * Defines request/response types for API routes to eliminate 15+ 'any' types
 * in src/app/api and src/app/(frontend)/(cloud) handlers.
 */

/**
 * Stripe SetupIntent response
 * Used in card validation flow
 */
export interface StripeSetupIntentResponse {
  client_secret: string
}

/**
 * Stripe subscription response
 * Used in subscription creation flow
 */
export interface StripeSubscriptionResponse {
  subscription: Record<string, unknown>
}

/**
 * Deploy API request body
 * Used in deployment flow to pass project configuration
 */
export interface DeployRequestBody {
  project: {
    id?: string
    freeTrial?: boolean
    paymentMethod?: string | null
    template?: string
    plan: string
    team: string
    projectName?: string
    environmentVariables?: Array<{ key: string; value: string }>
    domains?: string[]
  }
}

/**
 * Deploy API response
 * Used to handle deployment result or error
 */
export interface DeployResponseBody {
  doc?: Record<string, unknown>
  error?: string
  message?: string
}

/**
 * Create subscription request body
 */
export interface SubscriptionRequestBody {
  plan: string
  team: string
  freeTrial?: boolean
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  error?: string
  message?: string
  statusCode?: number
}

/**
 * Type guard: check if response is API error
 */
export function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    ('error' in response || 'message' in response)
  )
}

/**
 * Type guard: check if response has expected structure
 */
export function hasClientSecret(response: unknown): response is StripeSetupIntentResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof (response as Record<string, unknown>).client_secret === 'string'
  )
}
