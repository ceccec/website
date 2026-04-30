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

import type { TypedLocale, Where } from 'payload'

import { resolvePayloadLocale } from '@root/i18n/payloadLocale'
import { getPayload } from '@root/plugins/payload-runtime/getPayload'
import { draftMode } from 'next/headers'

export type DataLoaderContext = {
  depth?: number
  draft?: boolean
  locale?: TypedLocale
}

/** Builder for data loading operations. Fluent API with optional cache/revalidation support. */
export class DataLoaderBuilder {
  private _collection: string = ''
  private _depth: number = 0
  private _draft: boolean | undefined
  private _joins?: Record<string, any>
  private _limit?: number
  private _locale: TypedLocale | undefined
  private _overrideAccess: boolean = false
  private _select?: Record<string, boolean>
  private _sort?: string | string[]
  private _where: Where = {}

  constructor(private context?: DataLoaderContext) {}

  /** Resolve draft mode (context > arg > draftMode()). */
  private async resolveDraft(): Promise<boolean> {
    if (this.context?.draft !== undefined) {return this.context.draft}
    if (this._draft !== undefined) {return this._draft}
    return (await draftMode()).isEnabled
  }

  /** Resolve locale (context > arg > default). */
  private async resolveLocale(localeArg?: TypedLocale): Promise<TypedLocale> {
    if (localeArg) {return localeArg}
    if (this.context?.locale) {return this.context.locale}
    return resolvePayloadLocale()
  }

  /** Set the collection name (required). */
  collection(name: string): this {
    this._collection = name
    return this
  }

  /** Set cache depth. */
  depth(d: number): this {
    this._depth = d
    return this
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
      limit: this._limit ?? 300,
      locale,
      overrideAccess: this._overrideAccess,
      select: this._select,
      where: this._where,
      ...(this._sort && { sort: this._sort }),
      ...(this._joins && { joins: this._joins }),
    })

    return result.docs as T[]
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
      limit: 1,
      locale,
      overrideAccess: this._overrideAccess,
      select: this._select,
      where: this._where,
      ...(this._sort && { sort: this._sort }),
      ...(this._joins && { joins: this._joins }),
    })

    return (result.docs[0] as T) ?? undefined
  }

  /** Set JOINS for relational expansion. */
  joins(value: Record<string, any>): this {
    this._joins = value
    return this
  }

  /** Set LIMIT. */
  limit(n: number): this {
    this._limit = n
    return this
  }

  /** Override access control (for draft preview). */
  overrideAccess(enable: boolean = true): this {
    this._overrideAccess = enable
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

  /** Helper: exact slug match. */
  slug(value: string): this {
    this._where = { slug: { equals: value }, ...(this._where as any) }
    return this
  }

  /** Set SORT. */
  sort(value: string | string[]): this {
    this._sort = value
    return this
  }

  /** Set WHERE clause. */
  where(conditions: Where): this {
    this._where = conditions
    return this
  }
}

/**
 * Create a new data loader with optional context defaults.
 * @param context - Default locale, draft, depth for all operations
 */
export function createDataLoader(context?: DataLoaderContext): DataLoaderBuilder {
  return new DataLoaderBuilder(context)
}
