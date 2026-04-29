import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'
/**
 * Central Next.js cache paths for marketing routes — single source for hooks + ISR alignment.
 */
import { revalidatePath } from 'next/cache'

import { revalidateDocumentIDCache } from './revalidateDocumentIDCache'

/** Tag used with `fetchArchive` / category archives (`Categories` collection hooks). */
export const ARCHIVES_CACHE_TAG = 'archives'

export function revalidateArchivesListing(): void {
  revalidateTagImmediate(ARCHIVES_CACHE_TAG)
}

/** Shell globals (footer, nav, top bar) affect every page layout. */
export function revalidateRootLayout(): void {
  revalidatePath('/', 'layout')
}

export function revalidateGetStartedPage(): void {
  revalidatePath('/get-started')
}

/** Partner program global + partner listing chrome */
export function revalidatePartnersProgramLayout(): void {
  revalidatePath('/partners', 'layout')
}

type MarketingCollectionSlug = 'case-studies' | 'partners' | 'posts'

/** One helper for “document ID tag + detail + section listing” (collections share this shape). */
export function revalidateMarketingDocument(
  collection: MarketingCollectionSlug,
  id: number | string,
  revalidateUrls: () => void,
): void {
  revalidateDocumentIDCache(collection, id)
  revalidateUrls()
}

/** `/posts/[category]` listing */
export function revalidateBlogCategory(categorySlug: string): void {
  revalidatePath(`/posts/${categorySlug}`)
}

/** `/posts/[category]/[slug]` post detail */
export function revalidateBlogPost(categorySlug: string, postSlug: string): void {
  revalidatePath(`/posts/${categorySlug}/${postSlug}`)
}

/** `/docs/[topic]/[doc]` — topic + slug as stored; slug may include `.mdx` suffix */
export function revalidateDocsTopicDoc(topic: string, docSlug: string): void {
  const slug = docSlug.replace(/\.mdx$/i, '')
  revalidatePath(`/docs/${topic}/${slug}`)
}

/** `/case-studies/[slug]` + listing */
export function revalidateCaseStudy(slug: string): void {
  revalidatePath(`/case-studies/${slug}`)
  revalidatePath('/case-studies', 'page')
}

/** `/partners/[slug]` + listing */
export function revalidatePartner(slug: string): void {
  revalidatePath(`/partners/${slug}`)
  revalidatePath('/partners', 'page')
}
