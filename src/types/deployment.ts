/**
 * Canonical Deployment Types — single source of truth for one-click deployments
 *
 * Consolidates type definitions scattered across clone, import, new, and checkout flows.
 * Used by: useCreateProjectUseCase, useDeploymentCheckout, useStripeDeployment
 *
 * Principles:
 * - One definition per concept (not scattered across 3 flows)
 * - Immutable: use readonly where possible
 * - Discriminated unions for state variants
 */

import type { Plan, Project, Team, Template, User } from '@root/payload-cloud-types'
import type { Stripe, StripeElements } from '@stripe/stripe-js'

/** Source of project creation (clone template, import existing, or create new) */
export type ProjectSource = 'clone' | 'import' | 'new'

/** Unified parameters across all three project creation flows */
export interface CreateProjectParams {
  /** GitHub installation where repo will be created */
  installId?: number

  /** Make repository private */
  makePrivate?: boolean

  /** Project display name */
  projectName?: string

  /** Repository configuration */
  repo: {
    full_name?: string
    id?: number
    name: string
  }

  /** Project source (determines API behavior) */
  source: ProjectSource

  /** Team owner (defaults to user's first team) */
  teamId?: string

  /** Template (clone flow only) */
  templateId?: string

  /** Current user */
  user: null | undefined | User
}

/** Response from project creation */
export interface CreateProjectResult {
  project: Project
  redirectUrl: string
}

/** Deployment checkout state — unified across all flows */
export interface DeploymentCheckoutState {
  /** Free trial enabled (if plan supports it) */
  freeTrial: boolean

  /** Selected Stripe payment method Id */
  paymentMethod: null | string

  /** Selected plan for subscription */
  plan: null | Plan

  /** Selected payment method display (for UI) */
  selectedPaymentMethodLast4?: string

  /** Team with customer data (for saved payment methods) */
  team: null | Team
}

/** Stripe deployment orchestration state */
export interface StripeDeploymentState {
  error: null | string
  progress: {
    cardValidated: boolean
    paymentConfirmed: boolean
    projectDeployed: boolean
    subscriptionCreated: boolean
  }
  status: 'confirming-payment' | 'creating-subscription' | 'deploying' | 'error' | 'idle' | 'success' | 'validating-card'
}

/** Unified deployment execution parameters */
export interface ExecuteDeploymentParams {
  checkoutState: DeploymentCheckoutState
  formData: {
    domains?: string[]
    environmentVariables?: Array<{ key: string; value: string }>
  }
  installId?: number | string
  project: Project
  user: null | undefined | User
}

/** Stripe components required for deployment */
export interface StripeDeploymentContext {
  elements: null | StripeElements
  stripe: null | Stripe
}

/** Type guard: validate CreateProjectParams */
export function isValidCreateProjectParams(data: unknown): data is CreateProjectParams {
  return (
    typeof data === 'object' &&
    data !== null &&
    'source' in data &&
    'repo' in data &&
    typeof (data as any).source === 'string' &&
    ['clone', 'import', 'new'].includes((data as any).source)
  )
}

/** Type guard: validate DeploymentCheckoutState */
export function isValidCheckoutState(data: unknown): data is DeploymentCheckoutState {
  return (
    typeof data === 'object' &&
    data !== null &&
    'plan' in data &&
    'freeTrial' in data &&
    typeof (data as any).freeTrial === 'boolean'
  )
}

/** Type guard: validate ExecuteDeploymentParams */
export function isValidDeploymentParams(data: unknown): data is ExecuteDeploymentParams {
  return (
    typeof data === 'object' &&
    data !== null &&
    'project' in data &&
    'checkoutState' in data &&
    'formData' in data &&
    isValidCheckoutState((data as any).checkoutState)
  )
}
