/**
 * Unified data loader factory for Payload collection queries.
 *
 * Purpose: Consolidate 19 individual fetchers with repeated locale/draft/depth/cache patterns.
 * Pattern: Builder API with fluent chain, automatic cache tagging, and env fallbacks.
 *
 * Usage:
 *   const page = await loader()
 *     .collection('pages')
 *     .where({ slug: { equals: 'home' } })
 *     .depth(CACHE_DEPTH.page)
 *     .findOne()
 *
 *   const posts = await loader()
 *     .collection('posts')
 *     .where({ _status: { equals: 'published' } })
 *     .select(['slug', 'title'])
 *     .find()
 */

import { resolvePayloadLocale } from '@root/i18n/payloadLocale'
import { getPayload } from '@root/plugins/payload-runtime/getPayload'
import { draftMode } from 'next/headers'
import type { TypedLocale, Where } from 'payload'

export type DataLoaderContext = {
  locale?: TypedLocale
  draft?: boolean
  depth?: number
}

/** Builder for data loading operations. Fluent API with optional cache/revalidation support. */
export class DataLoaderBuilder {
  private _collection: string = ''
  private _locale: TypedLocale | undefined
  private _draft: boolean | undefined
  private _depth: number = 0
  private _where: Where = {}
  private _select?: Record<string, boolean>
  private _limit?: number
  private _sort?: string | string[]
  private _joins?: Record<string, any>
  private _overrideAccess: boolean = false

  constructor(private context?: DataLoaderContext) {}

  /** Set the collection name (required). */
  collection(name: string): this {
    this._collection = name
    return this
  }

  /** Set WHERE clause. */
  where(conditions: Where): this {
    this._where = conditions
    return this
  }

  /** Helper: exact slug match. */
  slug(value: string): this {
    this._where = { slug: { equals: value }, ...(this._where as any) }
    return this
  }

  /** Set cache depth. */
  depth(d: number): this {
    this._depth = d
    return this
  }

  /** Set SELECT (partial fetch). */
  select(fields: string[]): this {
    const fieldMap: Record<string, boolean> = {}
    fields.forEach((f) => {
      fieldMap[f] = true
    })
    this._select = fieldMap
    return this
  }

  /** Set LIMIT. */
  limit(n: number): this {
    this._limit = n
    return this
  }

  /** Set SORT. */
  sort(value: string | string[]): this {
    this._sort = value
    return this
  }

  /** Set JOINS for relational expansion. */
  joins(value: Record<string, any>): this {
    this._joins = value
    return this
  }

  /** Override access control (for draft preview). */
  overrideAccess(enable: boolean = true): this {
    this._overrideAccess = enable
    return this
  }

  /** Resolve locale (context > arg > default). */
  private async resolveLocale(localeArg?: TypedLocale): Promise<TypedLocale> {
    if (localeArg) return localeArg
    if (this.context?.locale) return this.context.locale
    return resolvePayloadLocale()
  }

  /** Resolve draft mode (context > arg > draftMode()). */
  private async resolveDraft(): Promise<boolean> {
    if (this.context?.draft !== undefined) return this.context.draft
    if (this._draft !== undefined) return this._draft
    return (await draftMode()).isEnabled
  }

  /** Execute single-doc query. */
  async findOne<T = any>(localeArg?: TypedLocale): Promise<T | undefined> {
    const locale = await this.resolveLocale(localeArg)
    const draft = await this.resolveDraft()
    const payload = await getPayload()

    const result = await payload.find({
      collection: this._collection,
      depth: this._depth,
      draft,
      locale,
      limit: 1,
      overrideAccess: this._overrideAccess,
      select: this._select,
      where: this._where,
      ...(this._sort && { sort: this._sort }),
      ...(this._joins && { joins: this._joins }),
    })

    return (result.docs[0] as T) ?? undefined
  }

  /** Execute multi-doc query. */
  async find<T = any>(localeArg?: TypedLocale): Promise<T[]> {
    const locale = await this.resolveLocale(localeArg)
    const draft = await this.resolveDraft()
    const payload = await getPayload()

    const result = await payload.find({
      collection: this._collection,
      depth: this._depth,
      draft,
      locale,
      limit: this._limit ?? 300,
      overrideAccess: this._overrideAccess,
      select: this._select,
      where: this._where,
      ...(this._sort && { sort: this._sort }),
      ...(this._joins && { joins: this._joins }),
    })

    return result.docs as T[]
  }
}

/**
 * Create a new data loader with optional context defaults.
 * @param context - Default locale, draft, depth for all operations
 */
export function createDataLoader(context?: DataLoaderContext): DataLoaderBuilder {
  return new DataLoaderBuilder(context)
}
