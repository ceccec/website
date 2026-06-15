import { liteClient } from 'algoliasearch/lite'
import React, { useState } from 'react'
import { Configure, InstantSearch } from 'react-instantsearch'

import { getInitialState } from './getInitialState'

type SearchClient = ReturnType<typeof liteClient>

let searchClient: SearchClient | undefined
const appId = process.env.NEXT_PUBLIC_ALGOLIA_CH_ID
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_KEY
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_CH_INDEX_NAME
if (appId && apiKey) {
  searchClient = liteClient(appId, apiKey)
}
export const algoliaPerPage = 20

export const AlgoliaProvider: React.FC<{
  children?: React.ReactNode
}> = (props) => {
  const { children } = props

  const [initialURLState] = useState(() => getInitialState())

  if (indexName) {
    return (
      <InstantSearch
        indexName={indexName}
        initialUiState={{
          [indexName]: {
            configure: {
              facetFilters: [['helpful:true']],
              facetingAfterDistinct: true,
              hitsPerPage: algoliaPerPage,
              ...initialURLState,
            },
          },
        }}
        searchClient={searchClient}
      >
        <Configure
          facetFilters={['helpful:true']}
          facetingAfterDistinct
          hitsPerPage={algoliaPerPage}
        />
        {children && children}
      </InstantSearch>
    )
  }

  return null
}
