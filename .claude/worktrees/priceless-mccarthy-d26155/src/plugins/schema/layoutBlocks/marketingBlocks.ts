import type { Block } from 'payload'

import { BlogContent } from '@root/blocks/BlogContent'
import { BlogMarkdown } from '@root/blocks/BlogMarkdown'
import { Callout } from '@root/blocks/Callout'
import { CallToAction } from '@root/blocks/CallToAction'
import { CardGrid } from '@root/blocks/CardGrid'
import { CaseStudiesHighlight } from '@root/blocks/CaseStudiesHighlight'
import { CaseStudyCards } from '@root/blocks/CaseStudyCards'
import { CaseStudyParallax } from '@root/blocks/CaseStudyParallax'
import { Code } from '@root/blocks/Code'
import { CodeFeature } from '@root/blocks/CodeFeature'
import { ComparisonTable } from '@root/blocks/ComparisonTable'
import { Content } from '@root/blocks/Content'
import { ContentGrid } from '@root/blocks/ContentGrid'
import { DownloadBlock } from '@root/blocks/Download'
import { CodeExampleBlock, ExampleTabs, MediaExampleBlock } from '@root/blocks/ExampleTabs'
import { Form } from '@root/blocks/Form'
import { HoverCards } from '@root/blocks/HoverCards'
import { HoverHighlights } from '@root/blocks/HoverHighlights'
import { LinkGrid } from '@root/blocks/LinkGrid'
import { LogoGrid } from '@root/blocks/LogoGrid'
import { MediaBlock } from '@root/blocks/Media'
import { MediaContent } from '@root/blocks/MediaContent'
import { MediaContentAccordion } from '@root/blocks/MediaContentAccordion'
import { Pricing } from '@root/blocks/Pricing'
import { ReusableContent as ReusableContentBlock } from '@root/blocks/ReusableContent'
import { Slider } from '@root/blocks/Slider'
import { Statement } from '@root/blocks/Statement'
import { Steps } from '@root/blocks/Steps'
import { StickyHighlights } from '@root/blocks/StickyHighlights'

/** Blocks sourced from `src/blocks/` (marketing / layout UI). */
export const marketingBlocks: Block[] = [
  BlogContent,
  BlogMarkdown,
  CodeExampleBlock,
  MediaExampleBlock,
  Callout,
  CallToAction,
  DownloadBlock,
  CardGrid,
  CaseStudyCards,
  CaseStudiesHighlight,
  CaseStudyParallax,
  CodeFeature,
  Content,
  ContentGrid,
  ComparisonTable,
  Form,
  HoverCards,
  HoverHighlights,
  LinkGrid,
  LogoGrid,
  MediaBlock,
  MediaContent,
  MediaContentAccordion,
  Pricing,
  ReusableContentBlock,
  Slider,
  Statement,
  Steps,
  StickyHighlights,
  ExampleTabs,
  Code,
]
