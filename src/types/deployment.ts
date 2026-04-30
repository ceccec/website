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
  /** Project source (determines API behavior) */
  source: ProjectSource

  /** GitHub installation where repo will be created */
  installId?: number

  /** Repository configuration */
  repo: {
    name: string
    full_name?: string
    id?: number
  }

  /** Team owner (defaults to user's first team) */
  teamId?: string

  /** Template (clone flow only) */
  templateId?: string

  /** Make repository private */
  makePrivate?: boolean

  /** Project display name */
  projectName?: string

  /** Current user */
  user: User | null | undefined
}

/** Response from project creation */
export interface CreateProjectResult {
  project: Project
  redirectUrl: string
}

/** Deployment checkout state — unified across all flows */
export interface DeploymentCheckoutState {
  /** Selected plan for subscription */
  plan: Plan | null

  /** Free trial enabled (if plan supports it) */
  freeTrial: boolean

  /** Selected Stripe payment method Id */
  paymentMethod: string | null

  /** Team with customer data (for saved payment methods) */
  team: Team | null

  /** Selected payment method display (for UI) */
  selectedPaymentMethodLast4?: string
}

/** Stripe deployment orchestration state */
export interface StripeDeploymentState {
  status: 'idle' | 'validating-card' | 'deploying' | 'creating-subscription' | 'confirming-payment' | 'success' | 'error'
  error: string | null
  progress: {
    cardValidated: boolean
    projectDeployed: boolean
    subscriptionCreated: boolean
    paymentConfirmed: boolean
  }
}

/** Unified deployment execution parameters */
export interface ExecuteDeploymentParams {
  project: Project
  checkoutState: DeploymentCheckoutState
  formData: {
    environmentVariables?: Array<{ key: string; value: string }>
    domains?: string[]
  }
  installId?: string | number
  user: User | null | undefined
}

/** Stripe components required for deployment */
export interface StripeDeploymentContext {
  stripe: Stripe | null
  elements: StripeElements | null
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
