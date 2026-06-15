'use server'

import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'
import { safeRevalidatePath } from '@utilities/safeRevalidate'

// this will invalidate the Next.js `Client-Side Router Cache`
// this type of cache is store during the user's session for client-side navigation
// this means that Server Components are not rebuilt when navigating between pages
// according to their docs, it is possible to purge this using a `Server Action`
// https://nextjs.org/docs/app/building-your-application/caching#router-cache
// https://nextjs.org/docs/app/building-your-application/caching#invalidation-1
export async function revalidateCache(args: {
  path?: string
  tag?: string
  tags?: string[]
}): Promise<void> {
  const { path, tag, tags } = args

  if (!path && !tag && !tags) {
    throw new Error('No path or tag(s) provided')
  }

  try {
    // Handle multiple tags (new pattern via uuidTags)
    if (tags && tags.length > 0) {
      for (const t of tags) {
        revalidateTagImmediate(t)
      }
    }
    // Handle single tag (legacy pattern for backwards compatibility)
    else if (tag) {
      revalidateTagImmediate(tag)
    }

    if (path) {
      safeRevalidatePath(path)
    }
    await Promise.resolve()
  } catch (error: unknown) {
    console.error(error) // eslint-disable-line no-console
  }
}
