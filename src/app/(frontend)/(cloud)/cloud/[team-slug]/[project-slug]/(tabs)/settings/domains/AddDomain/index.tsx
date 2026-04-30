'use client'

import type { OnSubmit } from '@forms/types'
import type { Project, Team } from '@root/payload-cloud-types'
import type { AddDomainFormData } from '@root/types/forms'

import { Text } from '@forms/fields/Text/index'
import Form from '@forms/Form/index'
import Submit from '@forms/Submit/index'
import { validateDomain } from '@forms/validations'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { toast } from 'sonner'

import classes from './index.module.scss'

const generateUUId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const domainFieldPath = 'newDomain'

export const AddDomain: React.FC<{
  environmentSlug: string
  project: Project
  team: Team
}> = ({ environmentSlug, project, team }) => {
  const [fieldKey, setFieldKey] = React.useState(generateUUId())

  const projectId = project?.id
  const projectDomains = project?.domains

  const router = useRouter()

  const saveDomain = React.useCallback<OnSubmit>(
    async ({ data }) => {
      const formData = data as Partial<AddDomainFormData>
      // The type `Project.domains[0]` -> does not work because the array is not required - Payload type issue?
      const newDomain: {
        cloudflareId?: string
        domain: string
        id?: string
      } = {
        domain: formData[domainFieldPath] as string,
      }

      const domainExists = projectDomains?.find(
        (projectDomain) => projectDomain.domain === newDomain.domain,
      )

      // TODO - toast messages

      if (!domainExists) {
        try {
          const req = await fetch(
            `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/projects/${projectId}${
              environmentSlug ? `?env=${environmentSlug}` : ''
            }`,
            {
              body: JSON.stringify({
                domains: [newDomain, ...(projectDomains || [])],
              }),
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'PATCH',
            },
          )

          if (req.status === 200) {
            router.refresh()
            setFieldKey(generateUUId())
            toast.success('Domain added successfully.')
          }

          return
        } catch (e) {
          console.error(e) // eslint-disable-line no-console
        }
      } else {
        setFieldKey(generateUUId())
      }
    },
    [projectId, projectDomains],
  )

  return (
    <Form className={classes.formContent} onSubmit={saveDomain}>
      <Text
        key={fieldKey}
        label="Domain"
        path={domainFieldPath}
        required
        validate={validateDomain}
      />

      <div className={classes.actionFooter}>
        <Submit appearance="secondary" icon={false} label="Save" />
      </div>
    </Form>
  )
}
