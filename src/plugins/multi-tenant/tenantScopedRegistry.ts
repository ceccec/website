import type { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import type { CollectionConfig } from 'payload'

import { Budgets, Industries, Regions, Specialties } from '@root/collections/PartnerFilters'
import { CaseStudies } from '@root/collections/CaseStudies'
import { Categories } from '@root/collections/Categories'
import { CommunityHelp } from '@root/collections/CommunityHelp'
import { Docs } from '@root/collections/Docs'
import { Media } from '@root/collections/Media'
import { Pages } from '@root/collections/Pages'
import { Partners } from '@root/collections/Partners'
import { Posts } from '@root/collections/Posts'
import { ReusableContent } from '@root/collections/ReusableContent'

import {
  docsTemplateEnabled,
  marketingContentEnabled,
  partnersTemplateEnabled,
} from '../env'

type MTCollections = NonNullable<Parameters<typeof multiTenantPlugin>[0]['collections']>
type MTCollectionEntry = NonNullable<MTCollections[keyof MTCollections]>

/**
 * One schema slice = env gate + Payload collections registered in `getSchemaPlugins`
 * before `@payloadcms/plugin-multi-tenant`. Slugs come from **`collection.slug`** (single source of truth).
 */
type TenantScopedSlice = {
  enabled: () => boolean
  collections: readonly CollectionConfig[]
}

const CORE: TenantScopedSlice = {
  enabled: () => true,
  collections: [Pages, Media, ReusableContent],
}

const MARKETING: TenantScopedSlice = {
  enabled: marketingContentEnabled,
  collections: [Posts, CaseStudies, CommunityHelp, Categories],
}

const DOCS: TenantScopedSlice = {
  enabled: docsTemplateEnabled,
  collections: [Docs],
}

const PARTNERS: TenantScopedSlice = {
  enabled: partnersTemplateEnabled,
  collections: [Partners, Industries, Specialties, Regions, Budgets],
}

/** Order matches schema registration intent; each slice is independent of the others. */
export const TENANT_SCOPED_SLICES: readonly TenantScopedSlice[] = [
  CORE,
  MARKETING,
  DOCS,
  PARTNERS,
]

/**
 * Optional `@payloadcms/plugin-multi-tenant` **collection** overrides keyed by slug.
 * Empty `{}` means plugin defaults (tenant field + base filter + merged access).
 */
const PLUGIN_OPTIONS_BY_SLUG: Record<string, Record<string, unknown>> = {
  [Pages.slug]: {
    useTenantAccess: false,
  },
}

/**
 * Slugs that receive `tenant` when multi-tenant runs — derived from {@link TENANT_SCOPED_SLICES}.
 */
export function resolveTenantScopedSlugs(): string[] {
  const slugs: string[] = []
  for (const slice of TENANT_SCOPED_SLICES) {
    if (!slice.enabled()) continue
    for (const col of slice.collections) {
      slugs.push(col.slug)
    }
  }
  return slugs
}

/**
 * Map consumed by `multiTenantPlugin({ collections })` — **DRY**: slugs from collections; options from {@link PLUGIN_OPTIONS_BY_SLUG}.
 */
export function buildMultiTenantCollections(): MTCollections {
  const out: Record<string, MTCollectionEntry> = {}
  for (const slice of TENANT_SCOPED_SLICES) {
    if (!slice.enabled()) continue
    for (const col of slice.collections) {
      const slug = col.slug
      out[slug] = (PLUGIN_OPTIONS_BY_SLUG[slug] ?? {}) as MTCollectionEntry
    }
  }
  return out as MTCollections
}
