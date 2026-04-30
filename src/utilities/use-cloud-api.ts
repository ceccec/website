import type { Deployment, Plan, Project, Team } from '@root/payload-cloud-types'

import { useAuth } from '@root/providers/Auth/index'
import { parseRestMessagePayload } from '@utilities/payloadCloudJson'
import { qs } from '@utilities/qs'
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

export type UseCloudAPI<R, A = null> = (args?: A) => {
  error: string
  isLoading: boolean | null
  reload: () => void
  reqStatus?: number
  result: R
}

export const useCloudAPI = <R>(args: {
  body?: string
  delay?: number
  initialState?: R
  interval?: number
  method?: 'GET' | 'POST'
  url?: string
}): ReturnType<UseCloudAPI<R>> => {
  const { body, delay = 250, initialState, interval, method = 'GET', url } = args
  const isRequesting = useRef(false)
  const [result, setResult] = useState<R>(initialState as unknown as R)
  const [isLoading, setIsLoading] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [requestTicker, dispatchRequestTicker] = useReducer((state: number) => state + 1, 0)
  const [reqStatus, setReqStatus] = useState<number | undefined>()

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (url) {
      if (isRequesting.current) {
        return
      }
      isRequesting.current = true

      const makeRequest = async (): Promise<void> => {
        try {
          setIsLoading(true)

          const req = await fetch(`${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}${url}`, {
            body,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            method,
          })

          setReqStatus(req.status)

          const json: unknown = await req.json()

          if (req.ok) {
            timer = setTimeout(() => {
              setResult(json as R)
              setError('')
              setIsLoading(false)
            }, delay)
          } else {
            setError(parseRestMessagePayload(json))
          }
        } catch (err: unknown) {
          const message = (err as Error)?.message || 'Something went wrong'
          setError(message)
          setIsLoading(false)
        }

        isRequesting.current = false
      }

      void makeRequest()
    }

    return () => {
      clearTimeout(timer)
    }
  }, [url, requestTicker, delay, method, body])

  const reload = useCallback(() => {
    isRequesting.current = false
    dispatchRequestTicker()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (url && interval) {
      timer = setTimeout(() => {
        reload()
      }, interval)
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [url, requestTicker, reload, interval])

  const memoizedState = useMemo(
    () => ({ error, isLoading, reload, reqStatus, result }),
    [result, isLoading, error, reload, reqStatus],
  )

  return memoizedState
}

export const useGetPlans: UseCloudAPI<Plan[]> = () => {
  const response = useCloudAPI<{
    docs: Plan[]
  }>({
    url: '/api/plans?where[slug][not_equals]=enterprise&sort=order',
  })

  return useMemo(() => {
    return {
      ...response,
      result: response.result?.docs,
    }
  }, [response])
}

interface ProjectsData {
  docs: Project[]
  totalDocs: number
  totalPages: number
}

export const useGetProjects: UseCloudAPI<
  ProjectsData,
  {
    delay?: number
    initialState?: ProjectsData
    page?: number
    search?: string
    teams?: string[]
  }
> = (args) => {
  const { user } = useAuth()
  const { delay, initialState, page, search, teams: teamsFromArgs } = args || {}

  const teamsWithoutNone = teamsFromArgs?.filter((team) => team !== 'none') || []

  const userTeams =
    user?.teams?.map(({ team }) =>
      team && typeof team === 'object' && team !== null && 'id' in team ? team.id : team,
    ) || [].filter(Boolean)

  const teams = teamsWithoutNone && teamsWithoutNone?.length > 0 ? teamsWithoutNone : userTeams

  const query = qs.stringify({
    page,
    where: {
      team: {
        in: teams,
      },
      ...(search
        ? {
            name: {
              like: search,
            },
          }
        : {}),
    },
  })

  return useCloudAPI<ProjectsData>({
    delay,
    initialState,
    url: `/api/projects${query ? `?${query}` : ''}`,
  })
}

type ProjectWithTeam = {
  team: Team
} & Omit<Project, 'team'>

// you can get projects with either the `id` or `teamSlug` and `projectSlug`
export const useGetProject: UseCloudAPI<
  null | ProjectWithTeam | undefined,
  {
    projectId?: string
    projectSlug?: string
    teamSlug?: string
  }
> = (args) => {
  const { projectId, projectSlug, teamSlug } = args || {}

  const query = qs.stringify({
    where: {
      and: [
        {
          'team.slug': {
            equals: teamSlug,
          },
        },
        {
          slug: {
            equals: projectSlug,
          },
        },
      ],
    },
  })

  let url = teamSlug && projectSlug ? `/api/projects?${query}&limit=1` : ''

  if (projectId) {
    url = `/api/projects?where[id][equals]=${projectId}&limit=1`
  }

  const response = useCloudAPI<{
    docs: ProjectWithTeam[]
  }>({
    url,
  })

  return useMemo(() => {
    return {
      ...response,
      // `undefined` and `null` results are needed for loading states and 404 redirects
      result:
        (projectSlug || projectId) && response?.result?.docs
          ? response.result.docs?.[0] || null
          : undefined,
    }
  }, [response, projectSlug, projectId])
}

export const useGetProjectDeployments: UseCloudAPI<
  Deployment[],
  {
    environmentSlug?: string
    interval?: number
    page?: number
    projectId?: string
  }
> = (args) => {
  const { environmentSlug, interval, page = 0, projectId } = args || {}

  const query = qs.stringify({
    limit: 10,
    page,
    sort: '-createdAt',
    where: {
      and: [
        {
          project: {
            equals: projectId,
          },
        },
        {
          environmentSlug: {
            equals: environmentSlug,
          },
        },
      ],
    },
  })

  const url = `/api/deployments${query ? `?${query}` : ''}`

  const response = useCloudAPI<{
    docs: Deployment[]
  }>({
    interval,
    url,
  })

  return useMemo(() => {
    return {
      ...response,
      result: response.result?.docs,
    }
  }, [response])
}

export const useGetActiveProjectDeployment: UseCloudAPI<
  Deployment,
  {
    projectId?: string
  }
> = (args) => {
  const { projectId } = args || {}

  const query = qs.stringify({
    where: {
      and: [
        {
          project: {
            equals: projectId,
          },
        },
        {
          deploymentStatus: {
            equals: 'ACTIVE',
          },
        },
      ],
    },
  })
  // @TODO - need to thread through currently selected environment
  const url = `/api/deployments?${query}&limit=1`

  const response = useCloudAPI<{
    docs: Deployment[]
  }>({
    url,
  })

  return useMemo(() => {
    return {
      ...response,
      result: response.result?.docs?.[0],
    }
  }, [response])
}

export const useGetTeam: UseCloudAPI<null | Team | undefined, string> = (teamSlug) => {
  const response = useCloudAPI<{
    docs: Team[]
  }>({
    url: teamSlug ? `/api/teams?where[slug][equals]=${teamSlug.toLowerCase()}&limit=1` : '',
  })

  return useMemo(() => {
    return {
      ...response,
      // `undefined` and `null` results are needed for loading states and 404 redirects
      result: teamSlug && response?.result?.docs ? response.result.docs?.[0] || null : undefined,
    }
  }, [response, teamSlug])
}
