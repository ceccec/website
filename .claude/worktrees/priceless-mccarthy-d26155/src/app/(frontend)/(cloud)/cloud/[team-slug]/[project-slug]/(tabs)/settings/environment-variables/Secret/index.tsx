'use client'

import type { Project } from '@root/payload-cloud-types'

import { Accordion } from '@components/Accordion/index'
import { Spinner } from '@components/Spinner/index'
import { Text } from '@forms/fields/Text/index'
import * as React from 'react'

export const Secret: React.FC<{
  project: Project
}> = ({ project }) => {
  const [fetchedSecret, setFetchedSecret] = React.useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const projectId = project?.id

  const fetchSecret = React.useCallback(async (): Promise<null | string> => {
    const timer = setTimeout(() => {
      setIsLoading(true)
    }, 200)

    try {
      const req = await fetch(
        `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/projects/${projectId}/secret`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      clearTimeout(timer)

      if (req.status === 200) {
        const data: unknown = await req.json()
        setIsLoading(false)

        if (
          typeof data === 'object' &&
          data !== null &&
          'PAYLOAD_SECRET' in data &&
          typeof (data as { PAYLOAD_SECRET: unknown }).PAYLOAD_SECRET === 'string'
        ) {
          return (data as { PAYLOAD_SECRET: string }).PAYLOAD_SECRET
        }

        return null
      }
    } catch (e) {
      console.error(e) // eslint-disable-line no-console
      setIsLoading(false)
    }

    return null
  }, [projectId])

  let icon: React.ReactNode = null
  if (isLoading) {
    icon = <Spinner />
  }

  return (
    <Accordion
      label={
        <>
          <div>••••••••••••</div>
        </>
      }
      onToggle={async () => {
        if (!fetchedSecret) {
          const secretValue = await fetchSecret()
          if (secretValue) {
            setFetchedSecret(secretValue)
          }
        }
      }}
      toggleIcon="eye"
    >
      <Text disabled icon={icon} value={fetchedSecret} />
    </Accordion>
  )
}
