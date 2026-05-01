/**
 * Deployment Error Handling — centralized error handling for all deployment flows
 *
 * Eliminates 6+ copies of error handling across clone, import, checkout, and deploy flows.
 * Single source of truth for error messages, recovery strategies, and user feedback.
 */

/** Deployment error categories */
export enum DeploymentErrorCode {
  CARD_DECLINED = 'CARD_DECLINED',
  CARD_VALIdATION_FAILED = 'CARD_VALIdATION_FAILED',
  DEPLOYMENT_ALREADY_EXISTS = 'DEPLOYMENT_ALREADY_EXISTS',
  // Deployment errors
  DEPLOYMENT_FAILED = 'DEPLOYMENT_FAILED',
  // Infrastructure errors
  GITHUB_INTEGRATION_ERROR = 'GITHUB_INTEGRATION_ERROR',

  INVALId_CARD = 'INVALId_CARD',
  INVALId_PLAN = 'INVALId_PLAN',
  INVALId_TEMPLATE = 'INVALId_TEMPLATE',

  NO_INSTALLATION = 'NO_INSTALLATION',
  // Payment errors
  NO_PAYMENT_METHOD = 'NO_PAYMENT_METHOD',
  // Plan/checkout errors
  NO_PLAN_SELECTED = 'NO_PLAN_SELECTED',

  NO_TEAMS = 'NO_TEAMS',
  // Authentication errors
  NOT_LOGGED_IN = 'NOT_LOGGED_IN',
  PAYMENT_METHOD_MISSING = 'PAYMENT_METHOD_MISSING',
  PLAN_NOT_DEPLOYABLE = 'PLAN_NOT_DEPLOYABLE',
  // Project creation errors
  PROJECT_CREATE_FAILED = 'PROJECT_CREATE_FAILED',

  REPO_NAME_INVALId = 'REPO_NAME_INVALId',
  STRIPE_INTEGRATION_ERROR = 'STRIPE_INTEGRATION_ERROR',
  SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED',

  TEAM_NOT_FOUND = 'TEAM_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

interface DeploymentError {
  code: DeploymentErrorCode
  message: string
  recoveryAction?: 'contact-support' | 'login' | 'retry' | 'select-payment'
  statusCode?: number
  userMessage: string
}

/** Map error codes to user-friendly messages and recovery actions */
const ERROR_MAP: Record<DeploymentErrorCode, Omit<DeploymentError, 'code'>> = {
  [DeploymentErrorCode.CARD_DECLINED]: {
    message: 'Stripe card was declined',
    recoveryAction: 'select-payment',
    userMessage: 'Your card was declined. Please use a different payment method.',
  },
  [DeploymentErrorCode.CARD_VALIdATION_FAILED]: {
    message: 'Stripe SetupIntent validation failed',
    recoveryAction: 'select-payment',
    userMessage: 'The payment method validation failed. Please check your card details.',
  },
  [DeploymentErrorCode.DEPLOYMENT_ALREADY_EXISTS]: {
    message: 'Project already deployed',
    recoveryAction: 'retry',
    userMessage: 'This project has already been deployed. Redirecting to dashboard...',
  },
  [DeploymentErrorCode.DEPLOYMENT_FAILED]: {
    message: 'Project deployment failed',
    recoveryAction: 'contact-support',
    userMessage: 'Failed to deploy your project. Please try again or contact support.',
  },
  [DeploymentErrorCode.GITHUB_INTEGRATION_ERROR]: {
    message: 'GitHub integration failed',
    recoveryAction: 'contact-support',
    userMessage: 'Failed to create repository on GitHub. Please check your GitHub permissions.',
  },
  [DeploymentErrorCode.INVALId_CARD]: {
    message: 'Invalid card data',
    recoveryAction: 'select-payment',
    userMessage: 'The payment method is invalid. Please check your card details.',
  },
  [DeploymentErrorCode.INVALId_TEMPLATE]: {
    message: 'Template not found or invalid',
    recoveryAction: 'retry',
    userMessage: 'The selected template is not available.',
  },
  [DeploymentErrorCode.NO_INSTALLATION]: {
    message: 'GitHub installation not found',
    recoveryAction: 'retry',
    userMessage: 'Please select a GitHub organization or account.',
  },
  [DeploymentErrorCode.NO_PAYMENT_METHOD]: {
    message: 'No payment method and free trial not selected',
    recoveryAction: 'select-payment',
    userMessage: 'Please add a payment method or select "free trial" to continue.',
  },
  [DeploymentErrorCode.NO_PLAN_SELECTED]: {
    message: 'No plan selected in checkout',
    recoveryAction: 'retry',
    userMessage: 'Please select a plan to continue.',
  },
  [DeploymentErrorCode.NO_TEAMS]: {
    message: 'User has no teams',
    recoveryAction: 'contact-support',
    userMessage: 'You must be a member of a team to create a project.',
  },
  [DeploymentErrorCode.NOT_LOGGED_IN]: {
    message: 'User is not authenticated',
    recoveryAction: 'login',
    userMessage: 'You must log in to deploy a project.',
  },
  [DeploymentErrorCode.PAYMENT_METHOD_MISSING]: {
    message: 'Payment method Id missing after SetupIntent',
    recoveryAction: 'select-payment',
    userMessage: 'Payment method could not be processed. Please try again.',
  },
  [DeploymentErrorCode.PLAN_NOT_DEPLOYABLE]: {
    message: 'Selected plan cannot be deployed',
    recoveryAction: 'retry',
    userMessage: 'This plan is not available for deployment. Please select another plan.',
  },
  [DeploymentErrorCode.PROJECT_CREATE_FAILED]: {
    message: 'Failed to create draft project',
    recoveryAction: 'retry',
    userMessage: 'Could not create project draft. Please try again.',
  },
  [DeploymentErrorCode.REPO_NAME_INVALId]: {
    message: 'Repository name is invalid',
    recoveryAction: 'retry',
    userMessage: 'The repository name is invalid or already exists in your organization.',
  },
  [DeploymentErrorCode.STRIPE_INTEGRATION_ERROR]: {
    message: 'Stripe integration failed',
    recoveryAction: 'contact-support',
    userMessage: 'Payment processing failed. Please try again or contact support.',
  },
  [DeploymentErrorCode.SUBSCRIPTION_FAILED]: {
    message: 'Subscription creation failed',
    recoveryAction: 'contact-support',
    userMessage: 'Failed to create subscription. Your project may have been deployed but billing is incomplete. Contact support.',
  },
  [DeploymentErrorCode.TEAM_NOT_FOUND]: {
    message: 'Team not found',
    recoveryAction: 'contact-support',
    userMessage: 'The selected team could not be found.',
  },
  [DeploymentErrorCode.UNAUTHORIZED]: {
    message: 'User not authorized for this action',
    recoveryAction: 'contact-support',
    userMessage: 'You do not have permission to perform this action.',
  },
  [DeploymentErrorCode.UNKNOWN_ERROR]: {
    message: 'An unknown error occurred',
    recoveryAction: 'contact-support',
    userMessage: 'Something went wrong. Please try again or contact support.',
  },
}

/**
 * Create a standardized deployment error
 */
export function createDeploymentError(
  code: DeploymentErrorCode,
  details?: { message?: string; statusCode?: number },
): DeploymentError {
  const baseError = ERROR_MAP[code] || ERROR_MAP[DeploymentErrorCode.UNKNOWN_ERROR]
  return {
    code,
    ...baseError,
    message: details?.message || baseError.message,
    statusCode: details?.statusCode,
  }
}

/**
 * Parse API error response and convert to DeploymentError
 */
export function parseDeploymentError(
  error: unknown,
  fallbackCode: DeploymentErrorCode = DeploymentErrorCode.UNKNOWN_ERROR,
): DeploymentError {
  // Handle HTTP response errors
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'statusText' in error
  ) {
    const httpError = error as { status: number; statusText: string }
    if (httpError.status === 409) {
      return createDeploymentError(DeploymentErrorCode.DEPLOYMENT_ALREADY_EXISTS)
    }
    if (httpError.status === 401) {
      return createDeploymentError(DeploymentErrorCode.UNAUTHORIZED)
    }
  }

  // Handle JSON API error response
  if (typeof error === 'object' && error !== null) {
    const jsonError = error as Record<string, unknown>

    // Check for Stripe errors
    if (jsonError.type === 'StripeInvalidRequestError') {
      return createDeploymentError(DeploymentErrorCode.STRIPE_INTEGRATION_ERROR, {
        message: String(jsonError.message || 'Stripe error'),
      })
    }

    // Check for custom error codes
    if (typeof jsonError.code === 'string' && jsonError.code in ERROR_MAP) {
      return createDeploymentError(jsonError.code as DeploymentErrorCode, {
        message: String(jsonError.message || ''),
      })
    }

    // Check for error message
    if (typeof jsonError.error === 'string') {
      return createDeploymentError(fallbackCode, {
        message: jsonError.error,
      })
    }
    if (typeof jsonError.message === 'string') {
      return createDeploymentError(fallbackCode, {
        message: jsonError.message,
      })
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    return createDeploymentError(fallbackCode, {
      message: error.message,
    })
  }

  // Fallback
  return createDeploymentError(DeploymentErrorCode.UNKNOWN_ERROR)
}

/**
 * Check if error requires user action (vs automatic recovery)
 */
export function requiresUserAction(error: DeploymentError): boolean {
  return [
    'contact-support',
    'login',
    'select-payment',
  ].includes(error.recoveryAction || '')
}

/**
 * Get appropriate toast message for error
 */
export function getErrorToastMessage(error: DeploymentError): { description?: string; title: string } {
  return {
    description: error.statusCode ? `Error code: ${error.statusCode}` : undefined,
    title: error.userMessage,
  }
}
