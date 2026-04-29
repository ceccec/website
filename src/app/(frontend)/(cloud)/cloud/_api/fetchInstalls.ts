import type { Endpoints } from '@octokit/types'

import {
  parseGitHubInstallationsData,
  parsePayloadGraphQLBody,
  readJsonUnknown,
} from '@utilities/payloadCloudJson'

import { payloadCloudToken } from './token'

export type GitHubInstallationsResponse = Endpoints['GET /user/installations']['response']

export type Install = GitHubInstallationsResponse['data']['installations'][0]

async function installationsFromResponse(res: Response): Promise<Install[]> {
  if (!res.ok) {
    throw new Error(`Error getting installations: ${res.status}`)
  }
  const body = await readJsonUnknown(res)
  const envelope = parsePayloadGraphQLBody(body)
  if (envelope.errors?.length) {
    throw new Error(envelope.errors[0].message)
  }
  return parseGitHubInstallationsData(envelope.data)
}

export const fetchInstalls = async (): Promise<Install[]> => {
  const { cookies } = await import('next/headers')
  const token = (await cookies()).get(payloadCloudToken)?.value ?? null
  if (!token) {
    throw new Error('No token provided')
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/users/github`, {
    body: JSON.stringify({
      route: `GET /user/installations`,
    }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    method: 'POST',
    next: {
      tags: ['installs'],
    },
  })

  return installationsFromResponse(res)
}

export const fetchInstallsClient: () => Promise<Install[]> = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/users/github`, {
    body: JSON.stringify({
      route: `GET /user/installations`,
    }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  return installationsFromResponse(res)
}
