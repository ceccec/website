import { Banner } from '@components/Banner'
import { RenderDocs } from '@components/RenderDocs'
import { getPayload } from '@root/lib/getPayload'
import { notFound, redirect } from 'next/navigation'
import React from 'react'

import {
  buildDocsMetadata,
  findDocForMetadata,
  findDocForPage,
  findDocsSlugsForStaticParams,
} from '../../../docQueries'
import { fetchTopicsForSidebar } from '../../../fetchTopicsForSidebar'

export type TopicsOrder = { topics: string[] }[]

type Params = { doc: string; topic: string }

export const dynamic = 'force-static'

export default async function DocsPage({ params }: { params: Promise<Params> }) {
  const { doc: docSlug, topic: topicSlug } = await params

  if (process.env.NEXT_PUBLIC_ENABLE_LEGACY_DOCS !== 'true') {
    redirect(`/docs/${topicSlug}/${docSlug}`)
  }

  const payload = await getPayload()

  const curDoc = await findDocForPage(payload, { docSlug, topicSlug, version: 'v2' })

  const topicGroups = await fetchTopicsForSidebar({ payload, version: 'v2' })

  if (!curDoc?.docs?.length) {
    notFound()
  }

  const doc = curDoc.docs[0]

  return (
    <RenderDocs
      currentDoc={doc}
      docSlug={docSlug}
      topicGroups={topicGroups}
      topicSlug={topicSlug}
      version="v2"
    >
      <Banner type="warning">
        You are currently viewing documentation for version 2 of Payload.
      </Banner>
    </RenderDocs>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string; topic: string }>
}) {
  const { doc: docSlug, topic: topicSlug } = await params
  const payload = await getPayload()
  const docs = await findDocForMetadata(payload, { docSlug, topicSlug, version: 'v2' })

  const currentDoc = docs?.docs?.[0]

  return buildDocsMetadata({ currentDoc, docSlug, legacy: true, topicSlug })
}

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true

export async function generateStaticParams(): Promise<Params[]> {
  if (
    process.env.NEXT_PUBLIC_SKIP_BUILD_DOCS ||
    process.env.NEXT_PUBLIC_ENABLE_LEGACY_DOCS !== 'true'
  ) {
    return []
  }

  const payload = await getPayload()
  return findDocsSlugsForStaticParams(payload, 'v2')
}
