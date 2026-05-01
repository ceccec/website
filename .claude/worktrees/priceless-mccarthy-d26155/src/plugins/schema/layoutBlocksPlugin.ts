import type { Plugin } from 'payload'

import { layoutBlocks } from './layoutBlocks'

export const layoutBlocksPlugin: Plugin = (config) => ({
  ...config,
  blocks: [...(config.blocks ?? []), ...layoutBlocks],
})
