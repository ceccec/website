import type { Plugin } from 'payload'

import { seoPlugin } from '@payloadcms/plugin-seo'

import { marketingContentEnabled } from '../env'

function seoPluginTargets() {
  const marketing = marketingContentEnabled()
  return {
    collections: ['pages', ...(marketing ? (['case-studies', 'posts'] as const) : [])],
    globals: marketing ? (['get-started'] as const) : [],
  }
}

/** SEO tab collections/globals match enabled template slices (`PAYLOAD_TEMPLATE_MARKETING`). */
export function seo(): Plugin {
  const { collections, globals } = seoPluginTargets()
  return seoPlugin({
    collections: [...collections],
    globals: [...globals],
    uploadsCollection: 'media',
  })
}
