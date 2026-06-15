import { safeRevalidateTag } from '@utilities/safeRevalidate'

/**
 * On-demand tag invalidation. Next.js 16+ requires a cache profile; `max` purges
 * the tag for ISR / `fetch` cache entries using that tag. Routed through `safeRevalidateTag`
 * so it no-ops (instead of throwing) when called outside a request context (seeds, migrations).
 */
export function revalidateTagImmediate(tag: string): void {
  safeRevalidateTag(tag, 'max')
}
