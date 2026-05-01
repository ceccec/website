/**
 * Vercel Blob Storage Backend
 *
 * Uses Vercel Blob for object storage on Vercel deployments.
 * Integrated directly with Vercel infrastructure.
 */

import type { StorageBackend, StorageOptions } from '.'

/**
 * Vercel Blob Storage Backend implementation
 *
 * Dynamically imports Vercel Blob SDK to avoid dependency on non-Vercel deployments.
 */
export class VercelBlobStorageBackend implements StorageBackend {
  private blobClient: any

  constructor(token: string) {
    // Import is deferred to avoid hard dependency
    this.blobClient = null
    this.initializeClient(token).catch((err) => {
      console.error('[Storage] Failed to initialize Vercel Blob:', err)
    })
  }

  private async initializeClient(token: string): Promise<void> {
    try {
      const { put, get, delete: deleteBlob, list } = await import('@vercel/blob')
      this.blobClient = { put, get, delete: deleteBlob, list }
    } catch (err) {
      console.error('[Storage] Vercel Blob not available:', err)
      throw err
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.blobClient) return false

    try {
      const blob = await this.blobClient.get(key)
      return blob !== null
    } catch (err) {
      return false
    }
  }

  async get(key: string): Promise<Buffer | null> {
    if (!this.blobClient) return null

    try {
      const blob = await this.blobClient.get(key)
      if (!blob) return null
      return Buffer.from(await blob.arrayBuffer())
    } catch (err) {
      return null
    }
  }

  async getMetadata(
    key: string,
  ): Promise<{
    size: number
    modified: Date
    contentType?: string
  } | null> {
    if (!this.blobClient) return null

    try {
      const blob = await this.blobClient.get(key)
      if (!blob) return null

      return {
        size: blob.size,
        modified: new Date(blob.uploadedAt),
        contentType: blob.contentType,
      }
    } catch (err) {
      return null
    }
  }

  async put(
    key: string,
    data: Buffer | string,
    options?: StorageOptions,
  ): Promise<{
    url: string
  }> {
    if (!this.blobClient) {
      throw new Error('Vercel Blob client not initialized')
    }

    const buffer = typeof data === 'string' ? Buffer.from(data) : data

    const result = await this.blobClient.put(key, buffer, {
      contentType: options?.contentType,
      cacheControlMaxAge: options?.expirationSeconds,
    })

    return { url: result.url }
  }

  async delete(key: string): Promise<void> {
    if (!this.blobClient) return

    try {
      await this.blobClient.delete(key)
    } catch (err) {
      // Silently ignore; object may not exist
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (!this.blobClient) return

    for (const key of keys) {
      await this.delete(key)
    }
  }

  async list(prefix?: string): Promise<string[]> {
    if (!this.blobClient) return []

    try {
      const result = await this.blobClient.list({
        prefix,
      })

      return result.blobs.map((blob: any) => blob.pathname)
    } catch (err) {
      console.error('[Storage] Error listing Blob objects:', err)
      return []
    }
  }

  async getPublicUrl(key: string): Promise<string> {
    // Vercel Blob URLs are already public
    return `${process.env.NEXT_PUBLIC_SITE_URL}/blob/${key}`
  }

  async getSignedUrl(key: string, expirationSeconds?: number): Promise<string> {
    // Vercel Blob doesn't support signed URLs; return public URL
    return this.getPublicUrl(key)
  }

  async getStats(): Promise<{
    totalObjects: number
    totalSize: number
  }> {
    if (!this.blobClient) return { totalObjects: 0, totalSize: 0 }

    try {
      const result = await this.blobClient.list()

      let totalSize = 0
      for (const blob of result.blobs) {
        totalSize += blob.size
      }

      return {
        totalObjects: result.blobs.length,
        totalSize,
      }
    } catch (err) {
      console.error('[Storage] Error getting Blob stats:', err)
      return { totalObjects: 0, totalSize: 0 }
    }
  }
}
