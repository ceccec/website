import type { Config } from '@types'
import type { TypedLocale } from 'payload'

import localization from '@root/i18n/localization'
import { getPayload } from '@root/lib/getPayload'
import { unstable_cache } from 'next/cache'

type Collection = keyof Config['collections']

const defaultLocale = localization.defaultLocale as TypedLocale

/**
 * Local API `find` by slug. **`depth`** controls relation population (Ids vs nested docs);
 * **`locale`** must match the request when localized fields are used—see [Localization](https://payloadcms.com/docs/configuration/localization).
 */
async function getDocument(collection: Collection, slug: string, depth = 0, locale: TypedLocale = defaultLocale) {
  const payload = await getPayload()

  const page = await payload.find({
    collection,
    depth,
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return page.docs[0]
}

async function getDocumentById(collection: Collection, id: number | string, depth = 0, locale: TypedLocale = defaultLocale) {
  const payload = await getPayload()
  return payload.findById({ id, collection, depth, locale })
}

/**
 * `unstable_cache` keys include **depth** and **locale** (payload-performance) so different
 * population levels and locales never share the same cached row.
 */
export const getCachedDocument = (collection: Collection, slug: string, depth = 0, locale: TypedLocale = defaultLocale) =>
  unstable_cache(async () => getDocument(collection, slug, depth, locale), [collection, slug, String(depth), locale], {
    tags: [`${collection}_${slug}`],
  })

export const getCachedDocumentById = (collection: Collection, id: number | string, depth = 0, locale: TypedLocale = defaultLocale) =>
  unstable_cache(
    async () => getDocumentById(collection, id, depth, locale),
    [collection, 'byId', String(id), String(depth), locale],
    {
      tags: [`${collection}_id_${String(id)}`],
    },
  )
