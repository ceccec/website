import type { Block } from 'payload'

import { ArrowBlock } from '@root/collections/Docs/blocks/arrow'
import { BannerBlock } from '@root/collections/Docs/blocks/banner'
import { BulletListBlock } from '@root/collections/Docs/blocks/bulletList'
import { CodeBlock } from '@root/collections/Docs/blocks/code'
import { LightDarkImageBlock } from '@root/collections/Docs/blocks/lightDarkImage'
import { PayloadMediaBlock } from '@root/collections/Docs/blocks/payloadMedia'
import { PillBlock } from '@root/collections/Docs/blocks/pill'
import { ResourceBlock } from '@root/collections/Docs/blocks/resource'
import { RestExamplesBlock } from '@root/collections/Docs/blocks/restExamples'
import { TableWithDrawersBlock } from '@root/collections/Docs/blocks/tableWithDrawers'
import { UploadBlock } from '@root/collections/Docs/blocks/upload'
import { YoutubeBlock } from '@root/collections/Docs/blocks/youtube'

/** Blocks sourced from `src/collections/Docs/blocks/` (documentation MDX). */
export const documentationBlocks: Block[] = [
  LightDarkImageBlock,
  PayloadMediaBlock,
  TableWithDrawersBlock,
  YoutubeBlock,
  PillBlock,
  ArrowBlock,
  BulletListBlock,
  UploadBlock,
  RestExamplesBlock,
  ResourceBlock,
  BannerBlock,
  CodeBlock,
]
