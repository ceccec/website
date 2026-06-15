import type { Payload } from 'payload'

import { resolveIntegrationSecrets } from '@root/lib/resolveIntegrationSecrets'
import { resolvePublicSiteSetting } from '@root/lib/resolvePublicSiteSetting'
import { algoliasearch } from 'algoliasearch'

/** Keeps helpful flags in sync with Algolia (keys from Admin globals or env). */
export const updateAlgolia = async (
  payload: Payload,
  id: string,
  helpful: boolean,
): Promise<void> => {
  const [publicCfg, secrets] = await Promise.all([
    resolvePublicSiteSetting(),
    resolveIntegrationSecrets(payload),
  ])

  const appId = publicCfg.algoliaApplicationId
  const apiKey = secrets.algoliaAdminApiKey
  const indexName = publicCfg.algoliaCommunityIndexName

  if (!appId || !apiKey || !indexName) {
    return
  }

  const client = algoliasearch(appId, apiKey)

  await client
    .partialUpdateObject({
      indexName,
      objectID: id,
      attributesToUpdate: { helpful },
      createIfNotExists: false,
    })
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Updated objectId ' + id + ' in Algolia')
    })
}
