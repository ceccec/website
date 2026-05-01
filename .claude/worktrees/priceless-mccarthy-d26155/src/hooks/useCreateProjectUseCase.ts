/**
 * useCreateProjectUseCase — unified project creation for clone/import/new flows
 *
 * Consolidates createDraftProject.tsx logic (87 lines) into a single, reusable hook.
 * Used by: clone/[slug]/page_client, import/page_client, new/page_client
 *
 * Benefits:
 * - Single source of truth for project creation
 * - Consistent error handling
 * - Shared parameter validation
 * - Unified API call pattern
 */

import type { Project } from '@root/payload-cloud-types'
import type { CreateProjectParams, CreateProjectResult } from '@root/types/deployment'

import { revalidateCache } from '@cloud/_actions/revalidateCache'
import {
  createDeploymentError,
  DeploymentErrorCode,
  getErrorToastMessage,
  parseDeploymentError,
} from '@utilities/deploymentErrors'
import { assertRecordPayload, isRecord } from '@utilities/payloadCloudJson'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

interface UseCreateProjectUseCaseResult {
  createProject: (params: CreateProjectParams) => Promise<CreateProjectResult>
  error: null | string
  loading: boolean
  reset: () => void
}

/**
 * Hook for unified project creation across all flows (clone, import, new)
 */
export function useCreateProjectUseCase(): UseCreateProjectUseCaseResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const createProject = useCallback(async (params: CreateProjectParams): Promise<CreateProjectResult> => {
    setLoading(true)
    setError(null)

    try {
      // Validate required parameters
      if (!params.user) {
        const err = createDeploymentError(DeploymentErrorCode.NOT_LOGGED_IN)
        setError(err.userMessage)
        toast.error(getErrorToastMessage(err).title)
        throw new Error(err.message)
      }

      if (!params.user.teams || params.user.teams.length === 0) {
        const err = createDeploymentError(DeploymentErrorCode.NO_TEAMS)
        setError(err.userMessage)
        toast.error(getErrorToastMessage(err).title)
        throw new Error(err.message)
      }

      if (!params.repo?.name) {
        const err = createDeploymentError(DeploymentErrorCode.REPO_NAME_INVALId)
        setError(err.userMessage)
        toast.error(getErrorToastMessage(err).title)
        throw new Error(err.message)
      }

      // Determine team Id (use provided or fallback to first team)
      const resolvedTeamId =
        params.teamId ||
        (typeof params.user.teams[0]?.team === 'string'
          ? params.user.teams[0]?.team
          : params.user.teams[0]?.team?.id)

      if (!resolvedTeamId) {
        const err = createDeploymentError(DeploymentErrorCode.TEAM_NOT_FOUND)
        setError(err.userMessage)
        toast.error(getErrorToastMessage(err).title)
        throw new Error(err.message)
      }

      // Build draft project payload
      const draftProject: Record<string, unknown> = {
        name: params.projectName || params.repo.name || 'Untitled Project',
        defaultDomain: undefined,
        installId: params.installId ? params.installId.toString() : undefined,
        makePrivate: params.makePrivate,
        repositoryFullName: params.repo.full_name,
        repositoryId: params.repo.id ? params.repo.id.toString() : undefined, // import flow only
        repositoryName: params.repo.name,
        team: resolvedTeamId,
        template: params.templateId, // clone flow only
      }

      // Create draft project via API
      const projectReq = await fetch(
        `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/projects`,
        {
          body: JSON.stringify(draftProject),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      )

      const body = assertRecordPayload(await projectReq.json())
      const project = body.doc as Project | undefined
      const projectErrs = Array.isArray(body.errors) ? body.errors : undefined

      if (!projectReq.ok) {
        const firstErr =
          projectErrs?.[0] && isRecord(projectErrs[0]) && typeof projectErrs[0].message === 'string'
            ? projectErrs[0].message
            : 'Failed to create project'

        const err = createDeploymentError(DeploymentErrorCode.PROJECT_CREATE_FAILED, {
          message: firstErr,
        })
        setError(err.userMessage)
        toast.error(getErrorToastMessage(err).title)
        throw new Error(err.message)
      }

      if (!project) {
        const err = createDeploymentError(DeploymentErrorCode.PROJECT_CREATE_FAILED, {
          message: 'Project was created but no data returned',
        })
        setError(err.userMessage)
        toast.error(getErrorToastMessage(err).title)
        throw new Error(err.message)
      }

      // Revalidate cache
      await revalidateCache({
        tag: 'projects',
      })

      // Build redirect URL based on project and team
      const teamSlug =
        typeof project.team === 'string'
          ? project.team
          : project.team?.slug || resolvedTeamId

      const redirectUrl = `/cloud/${teamSlug}/${project.slug}/configure`

      return {
        project,
        redirectUrl,
      }
    } catch (err: unknown) {
      const deploymentError = parseDeploymentError(err, DeploymentErrorCode.PROJECT_CREATE_FAILED)
      setError(deploymentError.userMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return {
    createProject,
    error,
    loading,
    reset,
  }
}
