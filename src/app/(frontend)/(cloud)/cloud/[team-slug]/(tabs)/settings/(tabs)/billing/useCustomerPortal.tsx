import type { Team } from '@root/payload-cloud-types'

import { useRouter } from 'next/navigation'
import * as React from 'react'

const portalURL = `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/customer-portal`

export const useCustomerPortal = (args: {
  headline?: string
  returnURL?: string
  // if you send the subscriptionId, it will open the portal to that subscription
  // this uses the `subscription_cancel` flow in the customer portal
  subscriptionId?: string
  team: Team
}): {
  error: null | string
  loading: boolean
  openPortalSession: (e: React.MouseEvent<HTMLAnchorElement>) => Promise<void>
} => {
  const {
    headline = 'Payload Cloud',
    team,
    returnURL = `${process.env.NEXT_PUBLIC_SITE_URL}/cloud/${team.slug}/settings/billing`,
    subscriptionId,
  } = args

  const router = useRouter()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<null | string>(null)

  const openPortalSession = React.useCallback(
    async (e): Promise<void> => {
      // the href on the anchor is just for accessibility
      e.preventDefault()

      setError(null)
      setLoading(true)

      try {
        const req = await fetch(portalURL, {
          body: JSON.stringify({
            headline,
            returnURL,
            subscriptionId,
            team: team.id,
          }),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })

        const data: { error?: string; url?: string } = await req.json()

        if (req.ok) {
          if (data.url) {router.push(data.url)}
        } else {
          throw new Error(data.error ?? 'Something went wrong')
        }
      } catch (err: unknown) {
        setError(`Something went wrong: ${err}`)
        setLoading(false)
      }
    },
    [team, router, subscriptionId, returnURL, headline],
  )

  return {
    error,
    loading,
    openPortalSession,
  }
}
