/**
 * Object Storage Abstraction
 *
 * Abstracts different storage implementations across platforms:
 * - Cloudflare R2 for workers deployments
 * - Vercel Blob for Vercel deployments
 * - AWS S3 / S3-compatible for enterprise
 * - Local file system for Docker development
 * - In-memory for unit testing
 *
 * Enables platform-agnostic file uploads, downloads, and management.
 */

/**
 * Supported MIME types for common file categories
 */
export const MIME_TYPES = {
  JSON: 'application/json',
  TEXT: 'text/plain',
  HTML: 'text/html',
  CSS: 'text/css',
  JS: 'application/javascript',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  SVG: 'image/svg+xml',
  PDF: 'application/pdf',
  ZIP: 'application/zip',
} as const

/**
 * Options for storage operations
 */
export interface StorageOptions {
  contentType?: string
  metadata?: Record<string, string>
  cacheControl?: string
  expirationSeconds?: number
}

/**
 * Abstract storage backend interface
 *
 * All implementations should:
 * - Handle errors gracefully (log and rethrow with context)
 * - Support prefix-based organization (e.g., "uploads/media/")
 * - Be idempotent (get/put/delete should be safe to retry)
 */
export interface StorageBackend {
  /**
   * Check if a storage key exists
   */
  exists(key: string): Promise<boolean>

  /**
   * Get an object from storage
   * Returns null if key doesn't exist
   */
  get(key: string): Promise<Buffer | null>

  /**
   * Get object metadata (size, modified date, etc)
   */
  getMetadata(
    key: string,
  ): Promise<{
    size: number
    modified: Date
    contentType?: string
  } | null>

  /**
   * Put an object in storage
   */
  put(key: string, data: Buffer | string, options?: StorageOptions): Promise<{
    url: string
  }>

  /**
   * Delete an object from storage
   * Succeeds silently if key doesn't exist
   */
  delete(key: string): Promise<void>

  /**
   * Delete multiple objects at once
   */
  deleteMany(keys: string[]): Promise<void>

  /**
   * List all keys with an optional prefix
   * Returns empty array if no matches
   */
  list(prefix?: string): Promise<string[]>

  /**
   * Get public URL for a key (if applicable)
   * Some backends may require signed URLs or have a base URL
   */
  getPublicUrl(key: string): Promise<string>

  /**
   * Get signed download URL (with optional expiration)
   * For backends that support it; otherwise returns public URL
   */
  getSignedUrl(key: string, expirationSeconds?: number): Promise<string>

  /**
   * Get storage statistics
   */
  getStats(): Promise<{
    totalObjects: number
    totalSize: number
  }>
}

/**
 * In-memory storage backend for testing
 *
 * Stores objects in memory. Good for unit tests and development.
 * Data is lost on process restart.
 */
export class MemoryStorageBackend implements StorageBackend {
  private store = new Map<string, { data: Buffer; contentType?: string }>()

  async exists(key: string): Promise<boolean> {
    return this.store.has(key)
  }

  async get(key: string): Promise<Buffer | null> {
    return this.store.get(key)?.data || null
  }

  async getMetadata(
    key: string,
  ): Promise<{
    size: number
    modified: Date
    contentType?: string
  } | null> {
    const entry = this.store.get(key)
    if (!entry) return null

    return {
      size: entry.data.length,
      modified: new Date(),
      contentType: entry.contentType,
    }
  }

  async put(
    key: string,
    data: Buffer | string,
    options?: StorageOptions,
  ): Promise<{
    url: string
  }> {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    this.store.set(key, {
      data: buffer,
      contentType: options?.contentType,
    })
    return { url: `memory://${key}` }
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async deleteMany(keys: string[]): Promise<void> {
    for (const key of keys) {
      this.store.delete(key)
    }
  }

  async list(prefix?: string): Promise<string[]> {
    const keys = Array.from(this.store.keys())
    if (!prefix) return keys
    return keys.filter((k) => k.startsWith(prefix))
  }

  async getPublicUrl(key: string): Promise<string> {
    return `memory://${key}`
  }

  async getSignedUrl(key: string): Promise<string> {
    return `memory://${key}`
  }

  async getStats(): Promise<{
    totalObjects: number
    totalSize: number
  }> {
    let totalSize = 0
    for (const entry of this.store.values()) {
      totalSize += entry.data.length
    }
    return {
      totalObjects: this.store.size,
      totalSize,
    }
  }
}

/**
 * Global storage backend instance
 * Set during runtime initialization based on platform capabilities
 */
let globalStorageBackend: StorageBackend | null = null

/**
 * Initialize the global storage backend.
 *
 * Not currently auto-invoked: the platform-backend bootstrap was removed when the two getPayload
 * entries were consolidated onto `@root/lib/getPayload`. Nothing in the app reads this backend yet
 * (only unit tests) — call this explicitly once a consumer is wired up.
 */
export function initializeStorageBackend(backend: StorageBackend): void {
  globalStorageBackend = backend
}

/**
 * Get the active storage backend
 * Falls back to in-memory if not initialized
 */
export function getStorageBackend(): StorageBackend {
  if (!globalStorageBackend) {
    globalStorageBackend = new MemoryStorageBackend()
  }
  return globalStorageBackend
}

/**
 * Helper to put an object and get its public URL
 *
 * @example
 * const url = await storeFile('uploads/avatar.jpg', imageBuffer, {
 *   contentType: 'image/jpeg'
 * })
 */
export async function storeFile(
  key: string,
  data: Buffer | string,
  options?: StorageOptions,
): Promise<string> {
  const backend = getStorageBackend()
  const result = await backend.put(key, data, options)
  return result.url
}

/**
 * Helper to retrieve a stored object
 */
export async function retrieveFile(key: string): Promise<Buffer | null> {
  const backend = getStorageBackend()
  return backend.get(key)
}

/**
 * Helper to get a public URL for a stored object
 */
export async function getFileUrl(key: string): Promise<string> {
  const backend = getStorageBackend()
  return backend.getPublicUrl(key)
}

/**
 * Helper to delete a stored object
 */
export async function deleteFile(key: string): Promise<void> {
  const backend = getStorageBackend()
  return backend.delete(key)
}

/**
 * Helper to delete multiple objects
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  const backend = getStorageBackend()
  return backend.deleteMany(keys)
}

/**
 * Get storage statistics for monitoring
 */
export async function getStorageStats(): Promise<{
  totalObjects: number
  totalSize: number
}> {
  const backend = getStorageBackend()
  return backend.getStats()
}
