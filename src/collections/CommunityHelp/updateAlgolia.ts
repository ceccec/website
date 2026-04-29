import type { Payload } from 'payload'

import { resolveIntegrationSecrets } from '@root/lib/resolveIntegrationSecrets'
import { resolvePublicSiteSetting } from '@root/lib/resolvePublicSiteSetting'
import algoliasearch from 'algoliasearch'

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

  const appID = publicCfg.algoliaApplicationId
  const apiKey = secrets.algoliaAdminApiKey
  const indexName = publicCfg.algoliaCommunityIndexName

  if (!appID || !apiKey || !indexName) {
    return
  }

  const client = algoliasearch(appID, apiKey)
  const index = client.initIndex(indexName)

  await index
    .partialUpdateObject(
      {
        helpful,
        objectID: id,
      },
      {
        createIfNotExists: false,
      },
    )
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Updated objectID ' + id + ' in Algolia')
    })
}
