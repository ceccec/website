import { revalidateTag } from 'next/cache'

/**
 * On-demand tag invalidation. Next.js 16+ requires a cache profile; `max` purges
 * the tag for ISR / `fetch` cache entries using that tag.
 */
export function revalidateTagImmediate(tag: string): void {
  revalidateTag(tag, 'max')
}
