import type { Project } from '@root/payload-cloud-types'

import { PROJECT_QUERY, PROJECTS_QUERY } from '@data/project'
import { mergeProjectEnvironment } from '@root/utilities/merge-project-environment'
import { parsePayloadGraphQLBody } from '@root/utilities/payloadCloudJson'

import type { GraphQLJsonBody } from './graphqlJson'

import { payloadCloudToken } from './token'

export interface ProjectsRes {
  docs: Project[]

  limit: number
  page: number
  totalDocs: number
  totalPages: number
}

export const fetchProjects = async (teamIds: string[]): Promise<ProjectsRes> => {
  const { cookies } = await import('next/headers')
  const token = (await cookies()).get(payloadCloudToken)?.value ?? null
  if (!token) {
    throw new Error('No token provided')
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/graphql`, {
    body: JSON.stringify({
      query: PROJECTS_QUERY,
      variables: {
        limit: 8,
        page: 1,
        teamIds: teamIds.filter(Boolean),
      },
    }),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    method: 'POST',
    next: { tags: ['projects'] },
  })
    ?.then((r) => r.json())
    ?.then((json: unknown) => {
      const data = json as GraphQLJsonBody<{ Projects?: ProjectsRes }>
      if (data.errors) {
        throw new Error(data?.errors?.[0]?.message ?? 'Error fetching doc')
      }
      return data?.data?.Projects
    })

  if (!res) {
    throw new Error('Projects not found')
  }
  return res
}

export const fetchProjectsClient = async ({
  limit = 8,
  page = 1,
  search,
  teamIds,
}: {
  limit?: number
  page: number
  search?: string
  teamIds: Array<string | undefined>
}): Promise<ProjectsRes> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/graphql`, {
    body: JSON.stringify({
      query: PROJECTS_QUERY,
      variables: {
        limit,
        page,
        search,
        teamIds: teamIds.filter(Boolean),
      },
    }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((r) => r.json())
    ?.then((json: unknown) => {
      const data = json as GraphQLJsonBody<{ Projects?: ProjectsRes }>
      return data?.data?.Projects
    })

  return res as ProjectsRes
}

export const fetchProjectClient = async ({
  environmentSlug,
  projectSlug,
  teamId,
}: {
  environmentSlug?: string
  projectSlug?: string
  teamId: string
}): Promise<Project> => {
  const json = (await fetch(`${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/graphql`, {
    body: JSON.stringify({
      query: PROJECT_QUERY,
      variables: {
        projectSlug,
        teamId,
      },
    }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  }).then((res) => res.json()))
  const envelope = parsePayloadGraphQLBody(json)
  const data = envelope.data as { Projects?: { docs?: Project[] } } | undefined

  const project = data?.Projects?.docs?.[0]

  if (!project) {
    throw new Error('Project not found')
  }

  if (environmentSlug) {
    return mergeProjectEnvironment({ environmentSlug, project })
  }

  return project
}
