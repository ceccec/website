import type { Template } from '@root/payload-cloud-types'

import { TEMPLATES } from '@data/templates'
import { parseGraphQLResponse } from '@root/utilities/GraphQLParser'

import { payloadCloudToken } from './token'

export const fetchTemplates = async (): Promise<Template[]> => {
  const { cookies } = await import('next/headers')
  const token = (await cookies()).get(payloadCloudToken)?.value ?? null

  const response = await fetch(`${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/graphql`, {
    body: JSON.stringify({
      query: TEMPLATES,
    }),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    method: 'POST',
    next: { tags: ['templates'] },
  })

  const templatesData = await parseGraphQLResponse<{ docs?: Template[] }>(response, 'Templates')

  return templatesData?.docs ?? []
}
