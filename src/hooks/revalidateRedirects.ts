import type { Redirect } from '@types'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateDocumentIDCache } from '@root/utilities/revalidateDocumentIDCache'
import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'

/**
 * When a redirect targets a document by ID, `getCachedDocumentByID` may cache that row
 * (`payload-performance` / `getDocument` tag shape).
 */
function revalidateRedirectReferenceTargets(redirect: null | Redirect | undefined): void {
  const reference = redirect?.to?.reference
  if (!reference) {
    return
  }
  const { relationTo, value } = reference
  if (typeof value === 'number') {
    revalidateDocumentIDCache(relationTo, value)
  }
}

export const revalidateRedirects: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload },
}) => {
  payload.logger.info(`Revalidating redirects`)

  revalidateTagImmediate('redirects')
  revalidateRedirectReferenceTargets(doc as Redirect)
  revalidateRedirectReferenceTargets(previousDoc as Redirect | undefined)

  return doc
}

/** Runs when a redirect document is deleted — keep redirect list + destination ID caches aligned. */
export const revalidateRedirectsAfterDelete: CollectionAfterDeleteHook<Redirect> = ({
  doc,
  req: { payload },
}) => {
  payload.logger.info(`Revalidating redirects (after delete)`)

  revalidateTagImmediate('redirects')
  revalidateRedirectReferenceTargets(doc)

  return doc
}
