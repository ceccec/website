import type { Plugin } from 'payload'

import { seoPlugin } from '@payloadcms/plugin-seo'

import { marketingContentEnabled } from '../env'

/** SEO tab collections/globals match enabled template slices (`PAYLOAD_TEMPLATE_MARKETING`). */
export function seo(): Plugin {
  const collections: string[] = ['pages']
  if (marketingContentEnabled()) {
    collections.push('case-studies', 'posts')
  }
  const globals: string[] = []
  if (marketingContentEnabled()) {
    globals.push('get-started')
  }
  return seoPlugin({
    collections,
    globals,
    uploadsCollection: 'media',
  })
}
