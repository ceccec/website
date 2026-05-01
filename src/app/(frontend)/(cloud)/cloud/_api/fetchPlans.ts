import type { Plan } from '@root/payload-cloud-types'

import { PLANS_QUERY } from '@data/plans'
import { parseGraphQLResponse } from '@root/utilities/GraphQLParser'

export const fetchPlans = async (): Promise<Plan[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/graphql`, {
    body: JSON.stringify({
      query: PLANS_QUERY,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const plansData = await parseGraphQLResponse<{ docs?: Plan[] }>(response, 'Plans')

  return plansData?.docs ?? []
}
