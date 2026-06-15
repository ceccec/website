/**
 * Page collection URLs — breadcrumbs override bare slug routes (`/[slug]` vs `/home` → `/`).
 */
import { safeRevalidatePath } from '@utilities/safeRevalidate'

type PageLike = {
  breadcrumbs?: { url: string }[] | null
  slug?: null | string
}

export function revalidatePagePublicUrls(doc: PageLike): void {
  if (doc.breadcrumbs && doc.breadcrumbs.length > 0) {
    const url = doc.breadcrumbs[doc.breadcrumbs.length - 1].url
    safeRevalidatePath(url)
    if (doc.breadcrumbs[0]?.url === '/home') {
      safeRevalidatePath('/')
    }
    return
  }

  if (doc.slug) {
    safeRevalidatePath(`/${doc.slug}`)
    if (doc.slug === 'home') {
      safeRevalidatePath('/')
    }
  }
}
