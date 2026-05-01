import type { Block } from 'payload'

import { documentationBlocks } from './documentationBlocks'
import { marketingBlocks } from './marketingBlocks'
import { primitiveBlocks } from './primitiveBlocks'

/**
 * Full registry for page builder + docs. Order: marketing → documentation → primitives
 * (matches former single-file ordering groups).
 */
export const layoutBlocks: Block[] = [
  ...marketingBlocks,
  ...documentationBlocks,
  ...primitiveBlocks,
]
