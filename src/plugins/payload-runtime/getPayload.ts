import type { Payload } from 'payload'

import config from '@payload-config'
import { deepUuidWrap, isJsonLikeNode } from '@uuid'
import { getPayload as getPayloadFromPayload } from 'payload'

import { getCapabilities, logCapabilities } from '@root/lib/capabilities'
import {
  initializeCacheBackend,
  MemoryCacheBackend,
  getCacheBackend,
} from '@root/lib/cache'
import {
  initializeStorageBackend,
  MemoryStorageBackend,
  getStorageBackend,
} from '@root/lib/storage'
import {
  initializeImageTransformer,
  NextjsImageTransformer,
  getImageTransformer,
} from '@root/lib/images'

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
 * Initialize platform-specific backends based on detected capabilities
 *
 * This runs once when the app starts, detecting which services are available
 * (Cloudflare R2/D1, Postgres, Vercel Blob, Redis, etc) and initializing
 * appropriate backends with graceful fallbacks.
 *
 * @see src/lib/capabilities.ts
 */
function initializePlatformBackends(): void {
  const capabilities = getCapabilities()

  // Log detected capabilities for debugging
  logCapabilities('Payload Runtime Initialization')

  // Initialize cache backend
  if (capabilities.d1Database) {
    console.info('[Cache] Using Cloudflare D1 backend')
    // TODO: Initialize D1CacheBackend
    // initializeCacheBackend(new D1CacheBackend(env.D1))
  } else if (capabilities.postgresDatabase) {
    console.info('[Cache] Using Postgres backend')
    // TODO: Initialize PostgresCacheBackend
    // initializeCacheBackend(new PostgresCacheBackend(process.env.DATABASE_URL))
  } else if (capabilities.redisCache) {
    console.info('[Cache] Using Redis backend')
    // TODO: Initialize RedisCacheBackend
    // initializeCacheBackend(new RedisCacheBackend(process.env.REDIS_URL))
  } else {
    console.warn('[Cache] No persistent backend found; using in-memory (data lost on restart)')
    initializeCacheBackend(new MemoryCacheBackend())
  }

  // Initialize storage backend
  if (capabilities.r2Storage) {
    console.info('[Storage] Using Cloudflare R2 backend')
    // TODO: Initialize R2StorageBackend
    // initializeStorageBackend(new R2StorageBackend(env.R2))
  } else if (capabilities.vercelBlob) {
    console.info('[Storage] Using Vercel Blob backend')
    // TODO: Initialize VercelBlobStorageBackend
    // initializeStorageBackend(new VercelBlobStorageBackend(process.env.BLOB_READ_WRITE_TOKEN))
  } else if (process.env.S3_ENDPOINT) {
    console.info('[Storage] Using S3-compatible backend')
    // TODO: Initialize S3StorageBackend
    // initializeStorageBackend(new S3StorageBackend({...}))
  } else {
    console.warn('[Storage] No cloud storage configured; using in-memory')
    initializeStorageBackend(new MemoryStorageBackend())
  }

  // Initialize image transformer
  if (capabilities.imageOptimization) {
    console.info('[Images] Using Cloudflare Image Optimization')
    // TODO: Initialize CloudflareImageTransformer
    // initializeImageTransformer(new CloudflareImageTransformer())
  } else {
    console.info('[Images] Using Next.js default image optimization')
    initializeImageTransformer(new NextjsImageTransformer())
  }

  // Verify backends are initialized
  const cache = getCacheBackend()
  const storage = getStorageBackend()
  const images = getImageTransformer()

  console.info(`[Runtime] Cache backend: ${cache.constructor.name}`)
  console.info(`[Runtime] Storage backend: ${storage.constructor.name}`)
  console.info(`[Runtime] Image transformer: ${images.getName()}`)
}

/**
 * Local API entrypoint for Next server code — `import { getPayload } from 'payload'` + `{ config }`.
 *
 * Initializes platform-specific backends on first call.
 *
 * @see https://payloadcms.com/docs/local-api/overview
 */
let initializationDone = false
export async function getPayload(): Promise<Payload> {
  if (!initializationDone) {
    initializePlatformBackends()
    initializationDone = true
  }

  const inner = await getPayloadFromPayload({ config })
  return payloadWithDeepUuid(inner)
}
