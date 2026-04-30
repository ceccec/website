/**
 * useDeploymentCheckout — unified checkout state management
 *
 * Replaces custom reducer.ts (62 lines) with a simple, maintainable hook.
 * Manages: plan, payment method, team, free trial selection
 * Used by: Checkout.tsx (and potentially new checkout flows)
 *
 * Benefits:
 * - No custom reducer (simpler to understand)
 * - Direct state updates (no action dispatch boilerplate)
 * - Type-safe: DeploymentCheckoutState enforces correct structure
 * - Reusable across multiple checkout components
 */

import type { Plan, Team } from '@root/payload-cloud-types'
import type { DeploymentCheckoutState } from '@root/types/deployment'

import { useCallback, useState } from 'react'

interface UseDeploymentCheckoutOptions {
  initialFreeTrial?: boolean
  initialPaymentMethod?: null | string
  initialPlan?: null | Plan
  initialTeam?: null | Team
}

interface UseDeploymentCheckoutResult {
  reset: () => void
  setFreeTrial: (enabled: boolean) => void
  setPaymentMethod: (methodId: null | string, last4?: string) => void
  setPlan: (plan: null | Plan) => void
  setTeam: (team: null | Team) => void
  state: DeploymentCheckoutState
}

/**
 * Hook for managing deployment checkout state
 * Replaces custom reducer with simple, direct state management
 */
export function useDeploymentCheckout(options?: UseDeploymentCheckoutOptions): UseDeploymentCheckoutResult {
  const [state, setState] = useState<DeploymentCheckoutState>({
    freeTrial: options?.initialFreeTrial ?? false,
    paymentMethod: options?.initialPaymentMethod ?? null,
    plan: options?.initialPlan ?? null,
    selectedPaymentMethodLast4: undefined,
    team: options?.initialTeam ?? null,
  })

  const setPlan = useCallback((plan: null | Plan) => {
    setState(prev => ({
      ...prev,
      plan,
      // Reset free trial if plan doesn't support it
      freeTrial: plan && !('trial' in plan) ? false : prev.freeTrial,
    }))
  }, [])

  const setTeam = useCallback((team: null | Team) => {
    setState(prev => ({
      ...prev,
      team,
    }))
  }, [])

  const setPaymentMethod = useCallback((methodId: null | string, last4?: string) => {
    setState(prev => ({
      ...prev,
      paymentMethod: methodId,
      selectedPaymentMethodLast4: last4,
    }))
  }, [])

  const setFreeTrial = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      freeTrial: enabled,
      // Clear payment method if free trial is selected
      paymentMethod: enabled ? null : prev.paymentMethod,
    }))
  }, [])

  const reset = useCallback(() => {
    setState({
      freeTrial: options?.initialFreeTrial ?? false,
      paymentMethod: options?.initialPaymentMethod ?? null,
      plan: options?.initialPlan ?? null,
      selectedPaymentMethodLast4: undefined,
      team: options?.initialTeam ?? null,
    })
  }, [options])

  return {
    reset,
    setFreeTrial,
    setPaymentMethod,
    setPlan,
    setTeam,
    state,
  }
}

/**
 * Validation helper: ensure checkout state is valid for deployment
 */
export function isValidCheckoutState(state: DeploymentCheckoutState): {
  missingFields: string[]
  valid: boolean
} {
  const missingFields: string[] = []

  if (!state.plan) {
    missingFields.push('plan')
  }

  if (!state.team) {
    missingFields.push('team')
  }

  if (!state.freeTrial && !state.paymentMethod) {
    missingFields.push('paymentMethod (or enable free trial)')
  }

  return {
    missingFields,
    valid: missingFields.length === 0,
  }
}
