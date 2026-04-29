import type { Payload } from 'payload'

import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'

export type DocsPageVersion = 'v2' | 'v3'

function docsWhere(topicSlug: string, docSlug: string, version: DocsPageVersion) {
  return {
    slug: { equals: docSlug },
    topic: { equals: topicSlug },
    version: { equals: version },
  }
}

export async function findDocForPage(
  payload: Payload,
  args: { docSlug: string; topicSlug: string; version: DocsPageVersion },
) {
  const { docSlug, topicSlug, version } = args
  return payload.find({
    collection: 'docs',
    pagination: false,
    where: docsWhere(topicSlug, docSlug, version),
  })
}

export async function findDocForMetadata(
  payload: Payload,
  args: { docSlug: string; topicSlug: string; version: DocsPageVersion },
) {
  const { docSlug, topicSlug, version } = args
  return payload.find({
    collection: 'docs',
    depth: 0,
    pagination: false,
    select: {
      description: true,
      title: true,
    },
    where: docsWhere(topicSlug, docSlug, version),
  })
}

export async function findDocsSlugsForStaticParams(payload: Payload, version: DocsPageVersion) {
  const result = await payload.find({
    collection: 'docs',
    depth: 0,
    limit: 10000,
    pagination: false,
    select: {
      slug: true,
      topic: true,
    },
    where: {
      version: {
        equals: version,
      },
    },
  })

  return result.docs.map((doc) => ({
    doc: doc.slug.replace('.mdx', ''),
    topic: doc.topic.toLowerCase(),
  }))
}

type DocMeta = {
  description?: null | string
  title?: null | string
}

/** Shared metadata for `/docs/...` and legacy `/docs/v2/...` (optional `robots` for v2). */
export function buildDocsMetadata(input: {
  currentDoc: DocMeta | undefined
  docSlug: string
  legacy?: boolean
  topicSlug: string
}) {
  const { currentDoc, docSlug, legacy, topicSlug } = input
  const titleBase = `${currentDoc?.title ? `${currentDoc.title} | ` : ''}Documentation | Payload`

  const base = {
    description: currentDoc?.description || `Payload ${topicSlug} Documentation`,
    openGraph: mergeOpenGraph({
      images: [
        {
          url: `/api/og?topic=${topicSlug}&title=${currentDoc?.title}`,
        },
      ],
      title: titleBase,
      url: `/docs/${topicSlug}/${docSlug}`,
    }),
    title: titleBase,
  }

  if (legacy) {
    return { ...base, robots: 'noindex, nofollow, noarchive' as const }
  }

  return base
}
