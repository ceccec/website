import type { Block } from 'payload'

/** Shared kernel: marketing layout blocks before / after the page-only `comparisonTable` slot. */
const LAYOUT_SLUGS_BEFORE_COMPARISON = [
  'callout',
  'cta',
  'cardGrid',
  'caseStudyCards',
  'caseStudiesHighlight',
  'caseStudyParallax',
  'codeFeature',
  'content',
  'contentGrid',
] as const

const LAYOUT_SLUGS_AFTER_COMPARISON = [
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

/** `pages.layout` — marketing pages (includes `comparisonTable`). */
export const PAGE_LAYOUT_BLOCK_SLUGS = [
  ...LAYOUT_SLUGS_BEFORE_COMPARISON,
  'comparisonTable',
  ...LAYOUT_SLUGS_AFTER_COMPARISON,
] as const

/** `case-studies.layout` — same as pages minus `comparisonTable`. */
export const CASE_STUDY_LAYOUT_BLOCK_SLUGS = [
  ...LAYOUT_SLUGS_BEFORE_COMPARISON,
  ...LAYOUT_SLUGS_AFTER_COMPARISON,
] as const

/** `partner-program.contentBlocks.{beforeDirectory,afterDirectory}` — same allowlist as case studies. */
export const PARTNER_PROGRAM_DIRECTORY_BLOCK_SLUGS = CASE_STUDY_LAYOUT_BLOCK_SLUGS

/** String slugs for `reusable-content.layout` (prepend shared Banner block in {@link getReusableContentLayoutBlockReferences}). Order matches admin block picker UX (not the same as {@link PAGE_LAYOUT_BLOCK_SLUGS}). */
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

type ReusableLayoutRef = (typeof REUSABLE_CONTENT_LAYOUT_BLOCK_SLUGS)[number] | Block
type PostContentRef = (typeof POST_CONTENT_BLOCK_SLUGS)[number] | Block

export function getReusableContentLayoutBlockReferences(bannerBlock: Block): ReusableLayoutRef[] {
  return [bannerBlock, ...REUSABLE_CONTENT_LAYOUT_BLOCK_SLUGS]
}

export function getPostContentBlockReferences(bannerBlock: Block): PostContentRef[] {
  return [bannerBlock, ...POST_CONTENT_BLOCK_SLUGS]
}
