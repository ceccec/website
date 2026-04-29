import type { CollectionConfig, Plugin } from 'payload'

const SHORT_ID_FIELD = 'shortID'

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

/** Ensures admin quick-search matches partial UUIDs on `id` plus title; omits duplicate `id` column in favor of {@link SHORT_ID_FIELD}. */
function mergeListSearchableFields(collection: CollectionConfig): string[] | undefined {
  const admin = collection.admin
  const explicit = admin?.listSearchableFields
  const useAsTitle = admin?.useAsTitle

  const title =
    typeof useAsTitle === 'string'
      ? useAsTitle
      : typeof useAsTitle === 'undefined'
        ? 'id'
        : undefined

  if (explicit?.length) {
    return dedupeStrings([...explicit, 'id'])
  }

  if (title === 'id' || !title) {
    return ['id']
  }

  return dedupeStrings(['id', title])
}

function mergeDefaultColumns(collection: CollectionConfig): string[] {
  const admin = collection.admin
  const existing = admin?.defaultColumns
  const useAsTitle = admin?.useAsTitle
  const titleFallback =
    typeof useAsTitle === 'string' ? useAsTitle : 'updatedAt'

  if (existing?.length) {
    const rest = existing.filter((c) => c !== 'id' && c !== SHORT_ID_FIELD)
    return dedupeStrings([SHORT_ID_FIELD, ...rest])
  }

  return dedupeStrings([SHORT_ID_FIELD, titleFallback])
}

function shortIDUiField(): CollectionConfig['fields'][number] {
  return {
    name: SHORT_ID_FIELD,
    type: 'ui',
    admin: {
      components: {
        Cell: '@root/components/Admin/ShortIDCell#ShortIDCell',
      },
      disableBulkEdit: true,
    },
    label: 'ID',
  }
}

function patchCollection(collection: CollectionConfig): CollectionConfig {
  const fields = collection.fields ?? []
  const hasShortID = fields.some((f) => 'name' in f && f.name === SHORT_ID_FIELD)

  return {
    ...collection,
    admin: {
      ...collection.admin,
      defaultColumns: mergeDefaultColumns(collection),
      listSearchableFields: mergeListSearchableFields(collection),
    },
    fields: hasShortID ? fields : [...fields, shortIDUiField()],
  }
}

/**
 * Admin list: search includes `id` (partial UUID via `like`) plus title column; first column shows a short ID prefix (full id on hover). Edit URLs unchanged.
 */
export function adminListSearchPlugin(): Plugin {
  return (config) => ({
    ...config,
    collections: config.collections?.map(patchCollection),
  })
}
