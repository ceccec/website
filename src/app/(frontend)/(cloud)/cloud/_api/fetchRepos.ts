import type { Endpoints } from '@octokit/types'

import type { Install } from './fetchInstalls'
import type { GraphQLJsonBody } from './graphqlJson'

import { payloadCloudToken } from './token'

type GitHubResponse =
  Endpoints['GET /user/installations/{installation_id}/repositories']['response']

export type RepoResults = {} & GitHubResponse['data']

export type Repo = GitHubResponse['data']['repositories'][0]

type GitHubProxyBody = GraphQLJsonBody<RepoResults>

export const fetchRepos = async (args: {
  install: Install
  page?: number
  per_page?: number
}): Promise<RepoResults> => {
  const { install, page, per_page } = args
  const installId = install && typeof install === 'object' ? install.id : install
  const { cookies } = await import('next/headers')
  const token = (await cookies()).get(payloadCloudToken)?.value ?? null
  if (!token) {
    throw new Error('No token provided')
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/users/github`,
    {
      body: JSON.stringify({
        route: `GET /user/installations/${installId}/repositories?${new URLSearchParams({
          page: page?.toString() ?? '1',
          per_page: per_page?.toString() ?? '30',
        })}`,
      }),
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      method: 'POST',
      next: {
        tags: ['repos'],
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Error getting repositories: ${response.status} ${response.statusText}`)
  }

  const json = await response.json() as GitHubProxyBody
  if (json.errors) {
    throw new Error(json?.errors?.[0]?.message ?? 'Error fetching docs')
  }

  const docs: RepoResults = json?.data
    })

  if (!docs) {
    throw new Error('Error fetching repositories')
  }
  return docs
}

export const fetchReposClient = async ({
  install,
  page,
  per_page,
}: {
  install: Install
  page?: number
  per_page?: number
}): Promise<RepoResults> => {
  const installId = install && typeof install === 'object' ? install.id : install

  const docs = await fetch(`${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/users/github`, {
    body: JSON.stringify({
      route: `GET /user/installations/${installId}/repositories?${new URLSearchParams({
        page: page?.toString() ?? '1',
        per_page: per_page?.toString() ?? '30',
      })}`,
    }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    ?.then((res) => {
      if (!res.ok) {
        throw new Error(`Error getting repositories: ${res.status}`)
      }
      return res.json()
    })
    ?.then((json: unknown) => {
      const res = json as GitHubProxyBody
      if (res.errors) {
        throw new Error(res?.errors?.[0]?.message ?? 'Error fetching docs')
      }
      return res?.data
    })

  if (!docs) {
    throw new Error('Error fetching repositories')
  }
  return docs
}
