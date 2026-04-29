/**
 * Single source for `blockReferences` allowlists on collections/globals that use {@link RenderBlocks}.
 * Keeps CMS allowlists aligned with `layoutBlockRegistry` / generated `payload-types` — add a slug
 * here and in `layoutBlocks` / registry together, then `pnpm generate:types`.
 */

import type { Block } from 'payload'

/** `pages.layout` — marketing pages (no blog banner/code-only strip). */
export const PAGE_LAYOUT_BLOCK_SLUGS = [
  'callout',
  'cta',
  'cardGrid',
  'caseStudyCards',
  'caseStudiesHighlight',
  'caseStudyParallax',
  'codeFeature',
  'content',
  'contentGrid',
  'comparisonTable',
  'form',
  'hoverCards',
  'hoverHighlights',
  'linkGrid',
  'logoGrid',
  'mediaBlock',
  'mediaContent',
  'mediaContentAccordion',
  'pricing',
  'reusableContentBlock',
  'slider',
  'statement',
  'steps',
  'stickyHighlights',
  'exampleTabs',
] as const

/** `case-studies.layout` */
export const CASE_STUDY_LAYOUT_BLOCK_SLUGS = [
  'callout',
  'cta',
  'cardGrid',
  'caseStudyCards',
  'caseStudiesHighlight',
  'caseStudyParallax',
  'codeFeature',
  'content',
  'contentGrid',
  'form',
  'hoverCards',
  'hoverHighlights',
  'linkGrid',
  'logoGrid',
  'mediaBlock',
  'mediaContent',
  'mediaContentAccordion',
  'pricing',
  'reusableContentBlock',
  'slider',
  'statement',
  'steps',
  'stickyHighlights',
  'exampleTabs',
] as const

/** `partner-program.contentBlocks.{beforeDirectory,afterDirectory}` — same allowlist as case studies. */
export const PARTNER_PROGRAM_DIRECTORY_BLOCK_SLUGS = CASE_STUDY_LAYOUT_BLOCK_SLUGS

/** String slugs for `reusable-content.layout` (prepend shared Banner block in {@link getReusableContentLayoutBlockReferences}). */
export const REUSABLE_CONTENT_LAYOUT_BLOCK_SLUGS = [
  'blogContent',
  'blogMarkdown',
  'callout',
  'cta',
  'cardGrid',
  'caseStudyCards',
  'caseStudiesHighlight',
  'caseStudyParallax',
  'code',
  'codeFeature',
  'comparisonTable',
  'content',
  'contentGrid',
  'exampleTabs',
  'form',
  'hoverCards',
  'hoverHighlights',
  'linkGrid',
  'logoGrid',
  'mediaBlock',
  'mediaContent',
  'mediaContentAccordion',
  'pricing',
  'slider',
  'statement',
  'steps',
  'stickyHighlights',
] as const

/** String slugs for `posts.content` (prepend shared Banner block in {@link getPostContentBlockReferences}). */
export const POST_CONTENT_BLOCK_SLUGS = [
  'blogContent',
  'code',
  'blogMarkdown',
  'mediaBlock',
  'reusableContentBlock',
] as const

export function getReusableContentLayoutBlockReferences(bannerBlock: Block): (Block | string)[] {
  return [bannerBlock, ...REUSABLE_CONTENT_LAYOUT_BLOCK_SLUGS]
}

export function getPostContentBlockReferences(bannerBlock: Block): (Block | string)[] {
  return [bannerBlock, ...POST_CONTENT_BLOCK_SLUGS]
}
