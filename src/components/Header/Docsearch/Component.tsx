'use client'

import { DocSearch } from '@docsearch/react'
import { useSitePublicConfigOptional } from '@root/providers/SitePublicConfig'
import { usePathname } from 'next/navigation'
import React from 'react'

import classes from './index.module.scss'
import { LocalFallback } from './LocalFallback'

function Hit({ children, hit, path }: { children: React.ReactNode; hit: { url?: string }; path: string }) {
  const blog = hit?.url?.includes('/blog/') || false

  let url = hit?.url

  if (path.includes('/docs/v2/') && url) {
    url = url.replace('/docs/', '/docs/v2/')
  }

  return (
    <a className={blog ? classes.blogResult : ''} href={url || '#'}>
      {children}
    </a>
  )
}

function Component() {
  const path = usePathname()
  const site = useSitePublicConfigOptional()
  const docsearchKey =
    site.algoliaDocsearchKey || process.env.NEXT_PUBLIC_ALGOLIA_DOCSEARCH_KEY || ''

  if (!docsearchKey.trim()) {
    return (
      <div className={classes.docSearch}>
        <LocalFallback />
      </div>
    )
  }

  return (
    <DocSearch
      apiKey={docsearchKey}
      appId="9MJY7K9GOW"
      hitComponent={({ children, hit }) => Hit({ children, hit, path })}
      indexName="payloadcms"
    />
  )
}

// eslint-disable-next-line no-restricted-exports -- consumed only via `next/dynamic(() => import('./Component'))`
export default Component
