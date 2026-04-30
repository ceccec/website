'use client'

import type { Project } from '@root/payload-cloud-types'
import type { EnvironmentVariableFormData } from '@root/types/forms'

import { revalidateCache } from '@cloud/_actions/revalidateCache'
import { uuidTags } from '@uuid'
import { Accordion } from '@components/Accordion/index'
import { Button } from '@components/Button/index'
import { Heading } from '@components/Heading/index'
import { ModalWindow } from '@components/ModalWindow/index'
import { CollapsibleGroup } from '@faceless-ui/collapsibles'
import { useModal } from '@faceless-ui/modal'
import { Text } from '@forms/fields/Text/index'
import { Textarea } from '@forms/fields/Textarea/index'
import Form from '@forms/Form/index'
import Submit from '@forms/Submit/index'
import { qs } from '@root/utilities/qs'
import {
  assertRecordPayload,
  parseOptionalMessagePayload,
} from '@utilities/payloadCloudJson'
import * as React from 'react'
import { toast } from 'sonner'

import { validateKey, validateValue } from '../validations'
import classes from './index.module.scss'

const envKeyFieldPath = 'envKey'
const envValueFieldPath = 'envValue'

type Props = {
  // env: Project['environmentVariables'][0]
  env: {
    id?: string
    key?: string
    value?: string
  }
  environmentSlug?: string
  envs: Project['environmentVariables']
  projectId: Project['id']
  projectSlug?: Project['slug']
}

export const ManageEnv: React.FC<Props> = ({
  env: { id, key },
  environmentSlug,
  envs,
  projectId,
  projectSlug,
}) => {
  const modalSlug = `delete-env-${id}`
  const [fetchedEnvValue, setFetchedEnvValue] = React.useState<string | undefined>(undefined)
  const { closeModal, openModal } = useModal()
  const existingEnvKeys = (envs || []).reduce((acc: string[], { key: existingKey }) => {
    if (existingKey && existingKey !== key) {
      acc.push(existingKey)
    }
    return acc
  }, [])

  const fetchEnv = React.useCallback(async (): Promise<null | string> => {
    try {
      const query = qs.stringify({
        env: environmentSlug,
        key,
      })
      const req = await fetch(
        `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/projects/${projectId}/env${`?${query}`}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (req.status === 200) {
        const res = assertRecordPayload(await req.json())
        const v = res.value
        return typeof v === 'string' ? v : null
      }
    } catch (e) {
      console.error(e) // eslint-disable-line no-console
    }

    return null
  }, [environmentSlug, key, projectId])

  const updateEnv = React.useCallback(
    async ({ data }: { data: EnvironmentVariableFormData }) => {
      const newEnvKey = data.envKey
      const newEnvValue = data.envValue

      if (typeof newEnvValue === 'string' && typeof newEnvKey === 'string' && id) {
        try {
          const query = qs.stringify({
            env: environmentSlug,
          })
          const req = await fetch(
            `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/projects/${projectId}/env${
              query ? `?${query}` : ''
            }`,
            {
              body: JSON.stringify({ arrayId: id, key: newEnvKey, value: newEnvValue }),
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'PATCH',
            },
          )

          const res = await req.json()

          if (!req.ok) {
            toast.error(parseOptionalMessagePayload(res) || 'Request failed.')
            return
          }

          if (req.status === 200) {
            toast.success('Environment variable updated successfully.')

            // Update local state for immediate UI feedback
            setFetchedEnvValue(newEnvValue)

            await revalidateCache({
              tags: uuidTags.cloud.projectDetailRevalidateTags({
                id: projectId,
                slug: projectSlug,
              }),
            })
          }
        } catch (e) {
          console.error(e) // eslint-disable-line no-console
        }
      }
    },
    [id, environmentSlug, projectId, projectSlug],
  )

  const deleteEnv = React.useCallback(async () => {
    try {
      const query = qs.stringify({
        env: environmentSlug,
        key,
      })
      const req = await fetch(
        `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/projects/${projectId}/env?${query}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'DELETE',
        },
      )

      const res = await req.json()

      if (!req.ok) {
        toast.error(parseOptionalMessagePayload(res) || 'Failed to delete environment variable.')
        return
      }

      if (req.status === 200) {
        toast.success('Environment variable deleted successfully.')
        closeModal(modalSlug)

        await revalidateCache({
          tags: uuidTags.cloud.projectDetailRevalidateTags({
            id: projectId,
            slug: projectSlug,
          }),
        })
      }
    } catch (e) {
      console.error(e) // eslint-disable-line no-console
      toast.error('An unexpected error occurred while deleting the environment variable.')
    }
  }, [environmentSlug, key, projectId, projectSlug, closeModal, modalSlug])

  return (
    <>
      <Accordion
        label={
          <>
            <p>{key}</p>
            <div>••••••••••••</div>
          </>
        }
        onToggle={async () => {
          if (!fetchedEnvValue && key) {
            const envValue = await fetchEnv()
            if (envValue) {
              setFetchedEnvValue(envValue)
            }
          }
        }}
        toggleIcon="eye"
      >
        <Form className={classes.accordionFormContent} onSubmit={updateEnv}>
          <Text
            initialValue={key}
            label="Key"
            path={envKeyFieldPath}
            required
            validate={(keyValue: string) => validateKey(keyValue, existingEnvKeys)}
          />

          <Textarea
            copy
            initialValue={fetchedEnvValue}
            label="Value"
            path={envValueFieldPath}
            required
            validate={validateValue}
          />

          <div className={classes.actionFooter}>
            <Button appearance="danger" label="Remove" onClick={() => openModal(modalSlug)} />
            <Submit icon={false} label="Update" />
          </div>
        </Form>
      </Accordion>
      <ModalWindow slug={modalSlug}>
        <div className={classes.modalContent}>
          <Heading as="h4" marginTop={false}>
            Are you sure you want to delete this environment variable?
          </Heading>
          <p>
            Deleting an environment variable from a project cannot be undone. You can manually add
            the env back to the project.
          </p>

          <div className={classes.modalActions}>
            <Button appearance="secondary" label="Cancel" onClick={() => closeModal(modalSlug)} />
            <Button appearance="danger" label="Delete" onClick={deleteEnv} />
          </div>
        </div>
      </ModalWindow>
    </>
  )
}

export const ManageEnvs: React.FC<{
  environmentSlug?: string
  envs: Project['environmentVariables']
  projectId: Project['id']
  projectSlug?: Project['slug']
}> = (props) => {
  const { environmentSlug, envs, projectId, projectSlug } = props

  return (
    <CollapsibleGroup allowMultiple transCurve="ease" transTime={250}>
      <div className={classes.envs}>
        {envs?.map((env) => (
          <ManageEnv
            env={env}
            environmentSlug={environmentSlug}
            envs={envs}
            key={env.id}
            projectId={projectId}
            projectSlug={projectSlug}
          />
        ))}
      </div>
    </CollapsibleGroup>
  )
}
