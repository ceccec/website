import { PayloadRedirects } from '@components/PayloadRedirects'
import { RenderDocs } from '@components/RenderDocs'
import { getPayload } from '@root/lib/getPayload'
import React from 'react'

import {
  buildDocsMetadata,
  findDocForMetadata,
  findDocForPage,
  findDocsSlugsForStaticParams,
} from '../../docQueries'
import { fetchTopicsForSidebar } from '../../fetchTopicsForSidebar'

export const dynamic = 'force-static'

type Params = { doc: string; topic: string }

export default async function DocsPage({ params }: { params: Promise<Params> }) {
  const { doc: docSlug, topic: topicSlug } = await params

  const payload = await getPayload()
  const curDoc = await findDocForPage(payload, { docSlug, topicSlug, version: 'v3' })

  const topicGroups = await fetchTopicsForSidebar({ payload, version: 'v3' })

  if (!curDoc?.docs?.length) {
    return <PayloadRedirects url={`/docs/${topicSlug}/${docSlug}`} />
  }

  const doc = curDoc.docs[0]

  return (
    <RenderDocs
      currentDoc={doc}
      docSlug={docSlug}
      topicGroups={topicGroups}
      topicSlug={topicSlug}
    />
  )
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { doc: docSlug, topic: topicSlug } = await params
  const payload = await getPayload()
  const docs = await findDocForMetadata(payload, { docSlug, topicSlug, version: 'v3' })

  const currentDoc = docs?.docs?.[0]

  return buildDocsMetadata({ currentDoc, docSlug, topicSlug })
}

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true

export async function generateStaticParams(): Promise<Params[]> {
  if (process.env.NEXT_PUBLIC_SKIP_BUILD_DOCS) {
    return []
  }

  const payload = await getPayload()
  return findDocsSlugsForStaticParams(payload, 'v3')
}
