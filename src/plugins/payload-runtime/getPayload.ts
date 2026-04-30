import type { Payload } from 'payload'

import config from '@payload-config'
import { deepUuidWrap, isJsonLikeNode } from '@uuid'
import { getPayload as getPayloadFromPayload } from 'payload'

/** Local API methods whose Promise results should pass through {@link deepUuidWrap} (reads + writes). */
const LOCAL_API_WITH_DOC_RESULTS = new Set([
  'create',
  'createGlobal',
  'delete',
  'duplicate',
  'find',
  'findById',
  'findDistinct',
  'findGlobal',
  'findGlobalVersionById',
  'findGlobalVersions',
  'findVersionById',
  'findVersions',
  'restoreGlobalVersion',
  'restoreVersion',
  'update',
  'updateGlobal',
])

function wrapDocsIfPresent(result: Record<string, unknown>): unknown {
  if (!Array.isArray(result.docs)) {
    return result
  }
  return {
    ...result,
    docs: result.docs.map((d) => (isJsonLikeNode(d) ? deepUuidWrap(d) : d)),
  }
}

function wrapPayloadLocalResult(method: string, result: unknown): unknown {
  if (result === null || typeof result !== 'object') {
    return result
  }

  const r = result as Record<string, unknown>

  if (Array.isArray(r.docs)) {
    return wrapDocsIfPresent(r)
  }

  if (r.doc !== undefined && isJsonLikeNode(r.doc)) {
    return { ...r, doc: deepUuidWrap(r.doc as object) }
  }

  const wrapRoot =
    LOCAL_API_WITH_DOC_RESULTS.has(method) &&
    method !== 'delete' &&
    method !== 'findDistinct'

  if (wrapRoot && isJsonLikeNode(result)) {
    return deepUuidWrap(result)
  }

  return result
}

function payloadWithDeepUuid(inner: Payload): Payload {
  return new Proxy(inner, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver)
      const key = typeof prop === 'string' ? prop : ''
      if (typeof val !== 'function' || !LOCAL_API_WITH_DOC_RESULTS.has(key)) {
        return typeof val === 'function' ? val.bind(target) : val
      }
      return (...args: unknown[]) => {
        const out = val.apply(target, args) as Promise<unknown>
        return out.then((result) => wrapPayloadLocalResult(key, result))
      }
    },
  })
}

/**
 * Local API entrypoint for Next server code — `import { getPayload } from 'payload'` + `{ config }`.
 *
 * @see https://payloadcms.com/docs/local-api/overview
 */
export async function getPayload(): Promise<Payload> {
  const inner = await getPayloadFromPayload({ config })
  return payloadWithDeepUuid(inner)
}
