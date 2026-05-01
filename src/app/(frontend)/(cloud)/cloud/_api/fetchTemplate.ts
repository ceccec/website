import type { Template } from '@root/payload-cloud-types'

import { TEMPLATE } from '@data/templates'
import { parseGraphQLResponse } from '@root/utilities/GraphQLParser'

export const fetchTemplate = async (templateSlug?: string): Promise<Template> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/graphql`, {
    body: JSON.stringify({
      query: TEMPLATE,
      variables: {
        slug: templateSlug,
      },
    }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const templatesData = await parseGraphQLResponse<{ docs?: Template[] }>(response, 'Templates')
  const template = templatesData?.docs?.[0]

  if (!template) {
    throw new Error('Template not found')
  }

  return template
}
