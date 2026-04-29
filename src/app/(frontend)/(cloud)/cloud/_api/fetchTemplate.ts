import type { Template } from '@root/payload-cloud-types'

import { TEMPLATE } from '@data/templates'

import type { GraphQLJsonBody } from './graphqlJson'

export const fetchTemplate = async (templateSlug?: string): Promise<Template> => {
  const doc = await fetch(`${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/graphql`, {
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
    ?.then((res) => res.json())
    ?.then((json: unknown) => {
      const res = json as GraphQLJsonBody<{ Templates?: { docs?: Template[] } }>
      if (res.errors) {
        throw new Error(res?.errors?.[0]?.message ?? 'Error fetching doc')
      }
      return res?.data?.Templates?.docs?.[0]
    })

  if (!doc) {
    throw new Error('Template not found')
  }
  return doc
}
