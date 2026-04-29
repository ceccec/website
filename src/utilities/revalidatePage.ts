import type { Payload } from 'payload'

import { revalidate } from './revalidate'

export const revalidatePage = ({
  collection,
  doc,
  payload,
}: {
  collection: string
  doc: any // eslint-disable-line @typescript-eslint/no-explicit-any
  payload: Payload
}): void => {
  if (doc._status === 'published') {
    void revalidate({ slug: doc.slug, collection, payload })
  }
}
