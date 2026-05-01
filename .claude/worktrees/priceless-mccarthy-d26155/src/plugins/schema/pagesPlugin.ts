import type { Plugin } from 'payload'

import { Pages } from '@root/collections/Pages'

/** Site page tree (requires layout blocks from `layoutBlocksPlugin`). */
export const pagesPlugin: Plugin = (config) => ({
  ...config,
  collections: [...(config.collections ?? []), Pages],
})
