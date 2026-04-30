import type { Team } from '@root/payload-cloud-types'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// TODO: type this using the Stripe module
export interface Subscription {
  default_payment_method: string
}

export const useSubscription = (args: {
  delay?: number
  initialValue?: null | Subscription
  stripeSubscriptionId?: string
  team: Team
}): {
  error: string
  isLoading: boolean | null
  refreshSubscription: () => void
  result: null | Subscription | undefined
  updateSubscription: (subscription: Subscription) => void
} => {
  const { delay, initialValue, stripeSubscriptionId, team } = args
  const isRequesting = useRef(false)
  const [result, setResult] = useState<null | Subscription | undefined>(initialValue)
  const [isLoading, setIsLoading] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const getSubscriptions = useCallback(() => {
    let timer: NodeJS.Timeout

    if (!stripeSubscriptionId) {
      setError('No subscription Id')
      return
    }

    if (isRequesting.current) {
      return
    }

    isRequesting.current = true

    const makeRetrieval = async (): Promise<void> => {
      try {
        setIsLoading(true)

        const req = await fetch(
          `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/teams/${team?.id}/subscriptions/${stripeSubscriptionId}`,
          {
            credentials: 'include',
            method: 'GET',
          },
        )

        const subscription: Subscription = await req.json()

        if (req.ok) {
          timer = setTimeout(() => {
            setResult(subscription)
            setError('')
            setIsLoading(false)
          }, delay)
        } else {
          // @ts-expect-error
          throw new Error(json?.message)
        }
      } catch (err: unknown) {
        const message = (err as Error)?.message || 'Something went wrong'
        setError(message)
        setIsLoading(false)
      }

      isRequesting.current = false
    }

    void makeRetrieval()

    return () => {
      clearTimeout(timer)
    }
  }, [delay, stripeSubscriptionId, team?.id])

  useEffect(() => {
    if (initialValue) {
      return
    }
    void getSubscriptions()
  }, [getSubscriptions, initialValue])

  const refreshSubscription = useCallback(() => {
    void getSubscriptions()
  }, [getSubscriptions])

  const updateSubscription = useCallback(
    (newSubscription: Subscription) => {
      let timer: NodeJS.Timeout

      if (!stripeSubscriptionId) {
        setError('No subscription Id')
        return
      }

      if (isRequesting.current) {
        return
      }

      isRequesting.current = true

      const makeUpdate = async (): Promise<void> => {
        try {
          setIsLoading(true)

          const req = await fetch(
            `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/teams/${team?.id}/subscriptions/${stripeSubscriptionId}`,
            {
              body: JSON.stringify(newSubscription),
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'PATCH',
            },
          )

          const subscription: Subscription = await req.json()

          if (req.ok) {
            timer = setTimeout(() => {
              setResult(subscription)
              setError('')
              setIsLoading(false)
            }, delay)
          } else {
            // @ts-expect-error
            throw new Error(json?.message)
          }
        } catch (err: unknown) {
          const message = (err as Error)?.message || 'Something went wrong'
          setError(message)
          setIsLoading(false)
        }

        isRequesting.current = false
      }

      void makeUpdate()

      return () => {
        clearTimeout(timer)
      }
    },
    [delay, stripeSubscriptionId, team?.id],
  )

  const memoizedState = useMemo(
    () => ({ error, isLoading, refreshSubscription, result, updateSubscription }),
    [result, isLoading, error, refreshSubscription, updateSubscription],
  )

  return memoizedState
}
