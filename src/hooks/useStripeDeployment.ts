/**
 * useStripeDeployment — unified Stripe deployment orchestration
 *
 * Consolidates & centralizes:
 * - confirmCardSetup.tsx (card validation via SetupIntent)
 * - createSubscription.ts (subscription creation)
 * - confirmCardPayment.tsx (payment confirmation)
 * - Error handling from deploy.tsx (206 lines total)
 * - Default payment method setting
 *
 * This is the canonical Stripe flow for deployments.
 * Used by: deploy() flow, checkout, any other deployment scenario
 *
 * Single responsibility: Handle all Stripe-related logic for deployments
 * Returns clear status updates and proper error handling
 */

import { useCallback, useState } from 'react'
import type { StripeElements, Stripe } from '@stripe/stripe-js'
import type { Project, User } from '@root/payload-cloud-types'

import { updateCustomer } from '@cloud/_api/updateCustomer'
import { teamHasDefaultPaymentMethod } from '@cloud/_utilities/teamHasDefaultPaymentMethod'
import {
  createDeploymentError,
  DeploymentErrorCode,
  parseDeploymentError,
  getErrorToastMessage,
} from '@utilities/deploymentErrors'
import type { DeploymentCheckoutState, StripeDeploymentState, ExecuteDeploymentParams } from '@root/types/deployment'
import { toast } from 'sonner'

interface UseStripeDeploymentResult {
  state: StripeDeploymentState
  deploy: (params: ExecuteDeploymentParams) => Promise<void>
  reset: () => void
}

/**
 * Canonical Stripe deployment orchestration
 *
 * Handles the complete flow:
 * 1. Validate card via SetupIntent
 * 2. Set default payment method if needed
 * 3. Deploy project via /api/deploy
 * 4. Create subscription
 * 5. Confirm payment
 *
 * Proper error recovery and user feedback at each stage.
 */
export function useStripeDeployment(
  stripe: Stripe | null,
  elements: StripeElements | null,
): UseStripeDeploymentResult {
  const [state, setState] = useState<StripeDeploymentState>({
    status: 'idle',
    error: null,
    progress: {
      cardValidated: false,
      projectDeployed: false,
      subscriptionCreated: false,
      paymentConfirmed: false,
    },
  })

  const deploy = useCallback(
    async (params: ExecuteDeploymentParams): Promise<void> => {
      if (!stripe || !elements) {
        const err = createDeploymentError(DeploymentErrorCode.STRIPE_INTEGRATION_ERROR, {
          message: 'Stripe not initialized',
        })
        setState(prev => ({ ...prev, error: err.userMessage, status: 'error' }))
        toast.error(getErrorToastMessage(err).title)
        throw new Error(err.message)
      }

      try {
        const { checkoutState, project, user, installId, formData } = params

        // === Stage 1: Validate Inputs ===
        if (!installId) {
          throw createDeploymentError(DeploymentErrorCode.NO_INSTALLATION, {
            message: 'No installation Id found',
          })
        }

        if (!user) {
          throw createDeploymentError(DeploymentErrorCode.NOT_LOGGED_IN)
        }

        if (!checkoutState.plan) {
          throw createDeploymentError(DeploymentErrorCode.NO_PLAN_SELECTED)
        }

        if (checkoutState.plan.private) {
          throw createDeploymentError(DeploymentErrorCode.PLAN_NOT_DEPLOYABLE, {
            message: 'This plan cannot be deployed through checkout',
          })
        }

        if (!checkoutState.freeTrial && !checkoutState.paymentMethod) {
          throw createDeploymentError(DeploymentErrorCode.NO_PAYMENT_METHOD)
        }

        // === Stage 2: Card Validation (if payment method provided) ===
        let paymentMethodId: string | null = null

        if (checkoutState.paymentMethod) {
          setState(prev => ({ ...prev, status: 'validating-card' }))

          // Create SetupIntent to validate card
          const setupResponse = await fetch(
            `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/stripe/setup-intent`,
            {
              body: JSON.stringify({
                teamId: typeof checkoutState.team === 'string' ? checkoutState.team : checkoutState.team?.id,
              }),
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              method: 'POST',
            },
          )

          if (!setupResponse.ok) {
            throw createDeploymentError(DeploymentErrorCode.CARD_VALIdATION_FAILED, {
              message: 'Failed to create SetupIntent',
            })
          }

          const { client_secret: setupSecret } = (await setupResponse.json()) as {
            client_secret: string
          }

          // Confirm card with SetupIntent
          const confirmResult = await stripe.confirmCardSetup(setupSecret, {
            payment_method: {
              card: elements.getElement('cardNumber')!,
              billing_details: {},
            },
          })

          if (confirmResult.error) {
            if (confirmResult.error.code === 'card_declined') {
              throw createDeploymentError(DeploymentErrorCode.CARD_DECLINED, {
                message: confirmResult.error.message,
              })
            }
            throw createDeploymentError(DeploymentErrorCode.CARD_VALIdATION_FAILED, {
              message: confirmResult.error.message || 'Card validation failed',
            })
          }

          // Extract payment method Id
          const setupIntent = confirmResult.setupIntent
          if (!setupIntent?.payment_method) {
            throw createDeploymentError(DeploymentErrorCode.PAYMENT_METHOD_MISSING)
          }

          paymentMethodId =
            typeof setupIntent.payment_method === 'string'
              ? setupIntent.payment_method
              : setupIntent.payment_method.id

          if (!paymentMethodId) {
            throw createDeploymentError(DeploymentErrorCode.PAYMENT_METHOD_MISSING)
          }

          setState(prev => ({
            ...prev,
            progress: { ...prev.progress, cardValidated: true },
          }))
        }

        // === Stage 3: Set Default Payment Method (if needed) ===
        if (
          paymentMethodId &&
          checkoutState.team &&
          !teamHasDefaultPaymentMethod(checkoutState.team)
        ) {
          try {
            await updateCustomer(checkoutState.team, {
              invoice_settings: {
                default_payment_method: paymentMethodId,
              },
            })
          } catch (err) {
            // Log but don't fail - proceed with deployment
            console.error('Failed to set default payment method:', err)
          }
        }

        // === Stage 4: Deploy Project ===
        setState(prev => ({ ...prev, status: 'deploying' }))

        const deployResponse = await fetch(
          `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/deploy`,
          {
            body: JSON.stringify({
              project: {
                id: project?.id,
                freeTrial: checkoutState.freeTrial,
                paymentMethod: paymentMethodId,
                template:
                  project?.template && typeof project.template !== 'string'
                    ? project.template.id
                    : project?.template,
                plan: typeof checkoutState.plan === 'string' ? checkoutState.plan : checkoutState.plan.id,
                team:
                  typeof checkoutState.team === 'string'
                    ? checkoutState.team
                    : checkoutState.team?.id,
                ...formData,
                environmentVariables: formData.environmentVariables?.filter(
                  ({ key, value }) => key && value,
                ),
              },
            }),
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          },
        )

        const deployBody = (await deployResponse.json()) as {
          doc?: Project
          error?: string
          message?: string
        }

        if (!deployResponse.ok) {
          if (deployResponse.status === 409) {
            throw createDeploymentError(DeploymentErrorCode.DEPLOYMENT_ALREADY_EXISTS)
          }
          throw createDeploymentError(DeploymentErrorCode.DEPLOYMENT_FAILED, {
            message: deployBody.error || deployBody.message || 'Deployment failed',
          })
        }

        if (!deployBody.doc) {
          throw createDeploymentError(DeploymentErrorCode.DEPLOYMENT_FAILED, {
            message: 'Deployment succeeded but no project returned',
          })
        }

        setState(prev => ({
          ...prev,
          progress: { ...prev.progress, projectDeployed: true },
        }))

        // === Stage 5: Create Subscription ===
        setState(prev => ({ ...prev, status: 'creating-subscription' }))

        const subscriptionResponse = await fetch(
          `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/subscriptions`,
          {
            body: JSON.stringify({
              plan: typeof checkoutState.plan === 'string' ? checkoutState.plan : checkoutState.plan.id,
              team:
                typeof checkoutState.team === 'string'
                  ? checkoutState.team
                  : checkoutState.team?.id,
              freeTrial: checkoutState.freeTrial,
            }),
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          },
        )

        if (!subscriptionResponse.ok) {
          throw createDeploymentError(DeploymentErrorCode.SUBSCRIPTION_FAILED, {
            message: 'Failed to create subscription - project deployed but billing incomplete',
          })
        }

        const { subscription } = (await subscriptionResponse.json()) as { subscription: unknown }

        setState(prev => ({
          ...prev,
          progress: { ...prev.progress, subscriptionCreated: true },
        }))

        // === Stage 6: Confirm Payment (if needed) ===
        if (paymentMethodId && subscription) {
          setState(prev => ({ ...prev, status: 'confirming-payment' }))

          // Confirm payment with stored payment method
          const confirmPaymentResult = await stripe.confirmCardPayment(
            (subscription as any).client_secret,
            {
              payment_method: paymentMethodId,
            },
          )

          if (confirmPaymentResult.error) {
            throw createDeploymentError(DeploymentErrorCode.CARD_DECLINED, {
              message: confirmPaymentResult.error.message || 'Payment confirmation failed',
            })
          }

          setState(prev => ({
            ...prev,
            progress: { ...prev.progress, paymentConfirmed: true },
          }))
        }

        // === Success ===
        setState({
          status: 'success',
          error: null,
          progress: {
            cardValidated: true,
            projectDeployed: true,
            subscriptionCreated: true,
            paymentConfirmed: true,
          },
        })

        toast.success('Deployment complete! Your project is being configured.')
      } catch (err: unknown) {
        window.scrollTo(0, 0)

        const deploymentError = parseDeploymentError(err, DeploymentErrorCode.UNKNOWN_ERROR)
        setState(prev => ({
          ...prev,
          error: deploymentError.userMessage,
          status: 'error',
        }))

        toast.error(getErrorToastMessage(deploymentError).title)
        throw err
      }
    },
    [stripe, elements],
  )

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      error: null,
      progress: {
        cardValidated: false,
        projectDeployed: false,
        subscriptionCreated: false,
        paymentConfirmed: false,
      },
    })
  }, [])

  return {
    state,
    deploy,
    reset,
  }
}
