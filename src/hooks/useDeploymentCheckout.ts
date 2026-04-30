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

import { useCallback, useState } from 'react'
import type { Plan, Team } from '@root/payload-cloud-types'
import type { DeploymentCheckoutState } from '@root/types/deployment'

interface UseDeploymentCheckoutOptions {
  initialPlan?: Plan | null
  initialTeam?: Team | null
  initialPaymentMethod?: string | null
  initialFreeTrial?: boolean
}

interface UseDeploymentCheckoutResult {
  state: DeploymentCheckoutState
  setPlan: (plan: Plan | null) => void
  setTeam: (team: Team | null) => void
  setPaymentMethod: (methodId: string | null, last4?: string) => void
  setFreeTrial: (enabled: boolean) => void
  reset: () => void
}

/**
 * Hook for managing deployment checkout state
 * Replaces custom reducer with simple, direct state management
 */
export function useDeploymentCheckout(options?: UseDeploymentCheckoutOptions): UseDeploymentCheckoutResult {
  const [state, setState] = useState<DeploymentCheckoutState>({
    plan: options?.initialPlan ?? null,
    team: options?.initialTeam ?? null,
    paymentMethod: options?.initialPaymentMethod ?? null,
    freeTrial: options?.initialFreeTrial ?? false,
    selectedPaymentMethodLast4: undefined,
  })

  const setPlan = useCallback((plan: Plan | null) => {
    setState(prev => ({
      ...prev,
      plan,
      // Reset free trial if plan doesn't support it
      freeTrial: plan && !('trial' in plan) ? false : prev.freeTrial,
    }))
  }, [])

  const setTeam = useCallback((team: Team | null) => {
    setState(prev => ({
      ...prev,
      team,
    }))
  }, [])

  const setPaymentMethod = useCallback((methodId: string | null, last4?: string) => {
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
      plan: options?.initialPlan ?? null,
      team: options?.initialTeam ?? null,
      paymentMethod: options?.initialPaymentMethod ?? null,
      freeTrial: options?.initialFreeTrial ?? false,
      selectedPaymentMethodLast4: undefined,
    })
  }, [options])

  return {
    state,
    setPlan,
    setTeam,
    setPaymentMethod,
    setFreeTrial,
    reset,
  }
}

/**
 * Validation helper: ensure checkout state is valid for deployment
 */
export function isValidCheckoutState(state: DeploymentCheckoutState): {
  valid: boolean
  missingFields: string[]
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
    valid: missingFields.length === 0,
    missingFields,
  }
}
