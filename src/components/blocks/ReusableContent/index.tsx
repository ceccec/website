import type { Page } from '@root/payload-types'

import { RenderBlocks } from '@components/RenderBlocks/index'
import React from 'react'

export type Props = Extract<Page['layout'][0], { blockType: 'reusableContentBlock' }>

export const ReusableContentBlock: React.FC<Props> = ({ reusableContentBlockFields }) => {
  const { customID, reusableContent } = reusableContentBlockFields

  if (typeof reusableContent === 'object' && reusableContent !== null) {
    return <RenderBlocks blocks={reusableContent.layout} customID={customID} disableGutter />
  }

  return null
}
