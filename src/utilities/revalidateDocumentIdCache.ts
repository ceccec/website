import type { Config } from '@types'

import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'

type CollectionSlug = keyof Config['collections']

/** Matches `getCachedDocumentByID` cache tags in `utilities/getDocument.ts`. */
export function revalidateDocumentIDCache(collection: CollectionSlug, id: number | string): void {
  revalidateTagImmediate(`${collection}_id_${String(id)}`)
}
