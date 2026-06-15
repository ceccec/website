import type { CollectionSlug, Payload, Where } from 'payload'

import { multiTenantEnabled } from '@root/plugins/env'
import {
  findTenantByRequestHost,
  orderedDomainCandidates,
} from '@root/plugins/site-settings/tenantPublicSite'

/** Tenant `parent` is injected by `@payloadcms/plugin-nested-docs` — same field name, official tree pattern. */

/** Default multi-tenant plugin field on scoped collections. */
export const TENANT_RELATION_FIELD = 'tenant'

const TENANTS_COLLECTION = 'tenants' as CollectionSlug

function extractRelationshipId(value: unknown): number | string | undefined {
  if (value === null || value === undefined) {return undefined}
  if (typeof value === 'string' || typeof value === 'number') {return value}
  if (typeof value === 'object' && 'id' in value && (value as { id: unknown }).id != null) {
    const id = (value as { id: number | string }).id
    return id
  }
  return undefined
}

function extractManyRelationshipIds(value: unknown): (number | string)[] {
  if (!Array.isArray(value)) {return []}
  const out: (number | string)[] = []
  for (const item of value) {
    const id = extractRelationshipId(item)
    if (id !== undefined) {out.push(id)}
  }
  return out
}

/**
 * Tenant ids whose **`tenant`** field should match when listing/searching content for this domain:
 * this tenant plus optional **`mergeContentFromTenants`** (canonical rows reused across domains).
 */
export function tenantIdsForContentVisibility(
  tenantId: number | string,
  tenantDoc: null | Record<string, unknown> | undefined,
): (number | string)[] {
  const seen = new Set<string>()
  const ordered: (number | string)[] = []
  const push = (id: number | string) => {
    const k = String(id)
    if (seen.has(k)) {return}
    seen.add(k)
    ordered.push(id)
  }

  push(tenantId)

  if (!tenantDoc || typeof tenantDoc !== 'object') {return ordered}

  for (const id of extractManyRelationshipIds(tenantDoc.mergeContentFromTenants)) {
    push(id)
  }

  return ordered
}

/** Resolve merge list after loading the tenant row (or pass preloaded doc from {@link findTenantByRequestHost}). */
export async function loadTenantIdsForContentVisibility(
  payload: Payload,
  tenantId: number | string,
): Promise<(number | string)[]> {
  if (!multiTenantEnabled()) {return []}

  const doc = await payload.findByID({
    id: tenantId,
    collection: TENANTS_COLLECTION,
    depth: 0,
    overrideAccess: true,
  })
  const row =
    doc && typeof doc === 'object' ? (doc as unknown as Record<string, unknown>) : undefined
  return tenantIdsForContentVisibility(tenantId, row)
}

/**
 * Convenience for RSC/handlers: resolve host → tenant → ids for `where: { tenant: { in: ids } }`.
 */
export async function resolveContentTenantIdsForHost(
  payload: Payload,
  host: string,
): Promise<(number | string)[]> {
  if (!multiTenantEnabled()) {return []}

  const tenant = await findTenantByRequestHost(payload, host)
  if (!tenant || typeof tenant !== 'object' || tenant.id == null) {return []}
  return tenantIdsForContentVisibility(tenant.id as number | string, tenant)
}

/**
 * All tenants whose `domain` appears in the host’s peeled chain (most specific first in results).
 * Use with domain-based scoping alongside {@link selfAndDescendantTenantIds}.
 */
export async function listTenantIdsForHostDomainChain(
  payload: Payload,
  host: string,
): Promise<(number | string)[]> {
  if (!multiTenantEnabled()) {return []}

  const candidates = orderedDomainCandidates(host)
  if (candidates.length === 0) {return []}

  const res = await payload.find({
    collection: TENANTS_COLLECTION,
    depth: 0,
    limit: candidates.length,
    overrideAccess: true,
    where: {
      domain: {
        in: candidates,
      },
    },
  })

  type Scored = { id: number | string; idx: number }
  const scored: Scored[] = []
  for (const doc of res.docs) {
    if (doc === null || typeof doc !== 'object' || !('id' in doc) || doc.id == null) {continue}
    const domain = (doc as { domain?: string }).domain
    const d =
      typeof domain === 'string' ? domain.trim().toLowerCase() : undefined
    const idx = d !== undefined ? candidates.indexOf(d) : -1
    scored.push({
      id: doc.id as number | string,
      idx: idx === -1 ? Number.POSITIVE_INFINITY : idx,
    })
  }
  scored.sort((a, b) => a.idx - b.idx)
  return scored.map((s) => s.id)
}

/** Walk `parent` pointers upward (immediate parent first, then grandparent, …). */
export async function listAncestorTenantIds(
  payload: Payload,
  tenantId: number | string,
): Promise<(number | string)[]> {
  if (!multiTenantEnabled()) {return []}

  const ancestors: (number | string)[] = []
  const seen = new Set<string>()
  let current: number | string | undefined = tenantId

  for (let depth = 0; depth < 64; depth++) {
    if (current === undefined) {break}
    const key = String(current)
    if (seen.has(key)) {break}
    seen.add(key)

    const doc = await payload.findByID({
      id: current,
      collection: TENANTS_COLLECTION,
      depth: 0,
      overrideAccess: true,
    })
    if (!doc || typeof doc !== 'object') {break}
    const parentId = extractRelationshipId((doc as { parent?: unknown }).parent)
    if (parentId === undefined) {break}
    ancestors.push(parentId)
    current = parentId
  }

  return ancestors
}

const PARENT_IN_CHUNK = 200

async function findTenantChildrenBatch(
  payload: Payload,
  parentIds: (number | string)[],
): Promise<(number | string)[]> {
  const collected: (number | string)[] = []
  for (let i = 0; i < parentIds.length; i += PARENT_IN_CHUNK) {
    const chunk = parentIds.slice(i, i + PARENT_IN_CHUNK)
    const res = await payload.find({
      collection: TENANTS_COLLECTION,
      depth: 0,
      limit: 500,
      overrideAccess: true,
      where: {
        parent: {
          in: chunk,
        },
      },
    })
    for (const doc of res.docs) {
      if (doc === null || typeof doc !== 'object' || !('id' in doc) || doc.id == null) {continue}
      collected.push(doc.id as number | string)
    }
  }
  return collected
}

/** All descendant tenant ids under `rootId` (BFS), **not** including `rootId`. One query per tree level (batched `parent in`). */
export async function listDescendantTenantIds(
  payload: Payload,
  rootId: number | string,
): Promise<(number | string)[]> {
  if (!multiTenantEnabled()) {return []}

  const out: (number | string)[] = []
  const seen = new Set<string>([String(rootId)])
  let frontier: (number | string)[] = [rootId]

  while (frontier.length > 0) {
    const children = await findTenantChildrenBatch(payload, frontier)
    const next: (number | string)[] = []
    for (const cid of children) {
      const ck = String(cid)
      if (seen.has(ck)) {continue}
      seen.add(ck)
      out.push(cid)
      next.push(cid)
    }
    frontier = next
  }

  return out
}

/** `[rootId, ...descendants]` for access filters and search (subtree). */
export async function selfAndDescendantTenantIds(
  payload: Payload,
  rootId: number | string,
): Promise<(number | string)[]> {
  if (!multiTenantEnabled()) {return []}

  const children = await listDescendantTenantIds(payload, rootId)
  return [rootId, ...children]
}

/**
 * Union of domain-chain tenants (host) and structural subtree (tenant id).
 * Use when both host context and a resolved tenant id apply (e.g. admin scoped to a node).
 */
export async function unionTenantScopeIds(
  payload: Payload,
  input: { host?: string; rootTenantId?: number | string },
): Promise<(number | string)[]> {
  if (!multiTenantEnabled()) {return []}

  const set = new Set<string>()
  const ordered: (number | string)[] = []

  const push = (id: number | string) => {
    const k = String(id)
    if (set.has(k)) {return}
    set.add(k)
    ordered.push(id)
  }

  if (input.host) {
    const chain = await listTenantIdsForHostDomainChain(payload, input.host)
    for (const id of chain) {push(id)}
  }

  if (input.rootTenantId !== undefined) {
    const subtree = await selfAndDescendantTenantIds(payload, input.rootTenantId)
    for (const id of subtree) {push(id)}
  }

  return ordered
}

/** Payload `where` clause: tenant field value is one of `ids`. Caller should skip when `ids` is empty. */
export function whereTenantIn(ids: (number | string)[], fieldName = TENANT_RELATION_FIELD): Where {
  return {
    [fieldName]: {
      in: ids,
    },
  } as Where
}
