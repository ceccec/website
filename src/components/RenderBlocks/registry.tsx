/**
 * Layout block registry for {@link RenderBlocks} — maps Payload `blockType` slugs to React components.
 *
 * **Allowlists:** `src/plugins/schema/layoutBlockReferences.ts` — keep in sync.
 *
 * **Guides:** [Blocks field](https://payloadcms.com/docs/fields/blocks) · [Examples overview](https://payloadcms.com/docs/examples/overview) · `payload-examples.mdc`.
 *
 * Add a block: schema (`layoutBlocks`) → `pnpm generate:types` → `layoutBlockReferences.ts` + this registry.
 *
 * **Rich text** blocks render via `components/RichText` `jsxConverters`, not this map.
 */

import type { CaseStudy, Page, PartnerProgram, Post, ReusableContent } from '@root/payload-types'
import type { ComponentType } from 'react'

import { BannerBlock } from '@blocks/Banner/index'
import { BlogContent } from '@blocks/BlogContent/index'
import { BlogMarkdown } from '@blocks/BlogMarkdown/index'
import { Callout } from '@blocks/Callout/index'
import { CallToAction } from '@blocks/CallToAction/index'
import { CardGrid } from '@blocks/CardGrid/index'
import { CaseStudiesHighlightBlock } from '@blocks/CaseStudiesHighlight/index'
import { CaseStudyCards } from '@blocks/CaseStudyCards/index'
import { CaseStudyParallax } from '@blocks/CaseStudyParallax/index'
import { CodeBlock } from '@blocks/CodeBlock/index'
import { CodeFeature } from '@blocks/CodeFeature/index'
import { ComparisonTable } from '@blocks/ComparisonTable'
import { ContentBlock } from '@blocks/Content/index'
import { ContentGrid } from '@blocks/ContentGrid/index'
import { ExampleTabsBlock } from '@blocks/ExampleTabs/index'
import { FormBlock } from '@blocks/FormBlock/index'
import { HoverCards } from '@blocks/HoverCards/index'
import { HoverHighlights } from '@blocks/HoverHighlights/index'
import { LinkGrid } from '@blocks/LinkGrid/index'
import { LogoGrid } from '@blocks/LogoGrid/index'
import { MediaBlock } from '@blocks/MediaBlock/index'
import { MediaContent } from '@blocks/MediaContent/index'
import { MediaContentAccordion } from '@blocks/MediaContentAccordion/index'
import { Pricing } from '@blocks/Pricing/index'
import { RelatedPosts } from '@blocks/RelatedPosts/index'
import { ReusableContentBlock } from '@blocks/ReusableContent/index'
import { Slider } from '@blocks/Slider/index'
import { Statement } from '@blocks/Statement/index'
import { Steps } from '@blocks/Steps/index'
import { StickyHighlights } from '@blocks/StickyHighlights/index'
import {
  CASE_STUDY_LAYOUT_BLOCK_SLUGS,
  PAGE_LAYOUT_BLOCK_SLUGS,
  POST_CONTENT_BLOCK_SLUGS,
  REUSABLE_CONTENT_LAYOUT_BLOCK_SLUGS,
} from '@root/plugins/schema/layoutBlockReferences'

/** `blockType` values from every Payload field that feeds {@link RenderBlocks}. */
export type BlockSlugFromBlocks<A> = NonNullable<A> extends readonly (infer U)[]
  ? U extends { blockType: infer B extends string }
    ? B
    : never
  : never

/** Union of every `blockType` stored in layouts/content that {@link RenderBlocks} must render. */
export type LayoutBlockSlug =
  /** Appended in {@link Post} only — not a Payload block document. */
  | 'relatedPosts'
  | BlockSlugFromBlocks<NonNullable<CaseStudy['layout']>>
   
   
  | BlockSlugFromBlocks<Page['layout']>
  | BlockSlugFromBlocks<Post['content']>
  | BlockSlugFromBlocks<ReusableContent['layout']>

/**
 * Single component type for the registry: each block’s props come from generated Payload types
 * and differ per slug; the render path passes the full block object via spread.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
type LayoutBlockComponent = ComponentType<any>

export const layoutBlockComponents = {
  banner: BannerBlock,
  blogContent: BlogContent,
  blogMarkdown: BlogMarkdown,
  callout: Callout,
  cardGrid: CardGrid,
  caseStudiesHighlight: CaseStudiesHighlightBlock,
  caseStudyCards: CaseStudyCards,
  caseStudyParallax: CaseStudyParallax,
  code: CodeBlock,
  codeFeature: CodeFeature,
  comparisonTable: ComparisonTable,
  content: ContentBlock,
  contentGrid: ContentGrid,
  cta: CallToAction,
  exampleTabs: ExampleTabsBlock,
  form: FormBlock,
  hoverCards: HoverCards,
  hoverHighlights: HoverHighlights,
  linkGrid: LinkGrid,
  logoGrid: LogoGrid,
  mediaBlock: MediaBlock,
  mediaContent: MediaContent,
  mediaContentAccordion: MediaContentAccordion,
  pricing: Pricing,
  relatedPosts: RelatedPosts,
  reusableContentBlock: ReusableContentBlock,
  slider: Slider,
  statement: Statement,
  steps: Steps,
  stickyHighlights: StickyHighlights,
} satisfies Record<LayoutBlockSlug, LayoutBlockComponent>

const registryKeys = new Set(Object.keys(layoutBlockComponents))

function assertAllowlistInRegistry(slugs: readonly string[], label: string): void {
  for (const slug of slugs) {
    if (!registryKeys.has(slug)) {
      throw new Error(
        `RenderBlocks registry missing "${slug}" — add the component to layoutBlockComponents() or remove it from ${label} in src/plugins/schema/layoutBlockReferences.ts.`,
      )
    }
  }
}

assertAllowlistInRegistry(PAGE_LAYOUT_BLOCK_SLUGS, 'PAGE_LAYOUT_BLOCK_SLUGS')
assertAllowlistInRegistry(CASE_STUDY_LAYOUT_BLOCK_SLUGS, 'CASE_STUDY_LAYOUT_BLOCK_SLUGS')
assertAllowlistInRegistry(REUSABLE_CONTENT_LAYOUT_BLOCK_SLUGS, 'REUSABLE_CONTENT_LAYOUT_BLOCK_SLUGS')
assertAllowlistInRegistry(POST_CONTENT_BLOCK_SLUGS, 'POST_CONTENT_BLOCK_SLUGS')
