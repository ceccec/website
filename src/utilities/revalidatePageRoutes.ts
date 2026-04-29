/**
 * Page collection URLs — breadcrumbs override bare slug routes (`/[slug]` vs `/home` → `/`).
 */
import { revalidatePath } from 'next/cache'

type PageLike = {
  breadcrumbs?: { url: string }[] | null
  slug?: null | string
}

export function revalidatePagePublicUrls(doc: PageLike): void {
  if (doc.breadcrumbs && doc.breadcrumbs.length > 0) {
    const url = doc.breadcrumbs[doc.breadcrumbs.length - 1].url
    revalidatePath(url)
    if (doc.breadcrumbs[0]?.url === '/home') {
      revalidatePath('/')
    }
    return
  }

  if (doc.slug) {
    revalidatePath(`/${doc.slug}`)
    if (doc.slug === 'home') {
      revalidatePath('/')
    }
  }
}
