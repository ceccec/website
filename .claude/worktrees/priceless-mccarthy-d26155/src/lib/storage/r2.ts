/**
 * Cloudflare R2 Storage Backend
 *
 * Uses Cloudflare R2 for object storage on Workers deployments.
 * Provides S3-compatible API with global availability.
 */

import type { StorageBackend, StorageOptions } from '.'

/**
 * R2 Storage Backend implementation for Cloudflare
 *
 * Uses Cloudflare's R2 bucket binding which is S3-compatible.
 */
export class R2StorageBackend implements StorageBackend {
  private bucket: any // R2Bucket

  constructor(bucket: any) {
    this.bucket = bucket
  }

  async exists(key: string): Promise<boolean> {
    try {
      const object = await this.bucket.head(key)
      return object !== null
    } catch (err) {
      return false
    }
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const object = await this.bucket.get(key)
      if (!object) return null
      return Buffer.from(await object.arrayBuffer())
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
    try {
      const object = await this.bucket.head(key)
      if (!object) return null

      return {
        size: object.size,
        modified: new Date(object.uploaded),
        contentType: object.httpMetadata?.contentType,
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
    const buffer = typeof data === 'string' ? Buffer.from(data) : data

    const customMetadata = options?.metadata || {}

    await this.bucket.put(key, buffer, {
      customMetadata,
      contentType: options?.contentType,
      cacheControl: options?.cacheControl,
    })

    // Return public URL (assumes bucket is public; adjust if using signed URLs)
    const url = `${this.getPublicUrlBase()}/${key}`
    return { url }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.bucket.delete(key)
    } catch (err) {
      // Silently ignore; object may not exist
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.delete(key)
    }
  }

  async list(prefix?: string): Promise<string[]> {
    const options = prefix ? { prefix } : {}
    const result = await this.bucket.list(options)

    return result.objects.map((obj: any) => obj.key)
  }

  async getPublicUrl(key: string): Promise<string> {
    return `${this.getPublicUrlBase()}/${key}`
  }

  async getSignedUrl(key: string, expirationSeconds?: number): Promise<string> {
    // R2 requires presigned URLs for non-public buckets
    try {
      const url = await this.bucket.createSignedURL(key, expirationSeconds || 3600, {
        method: 'get',
      })
      return url
    } catch (err) {
      // Fallback to public URL if signing fails
      return this.getPublicUrl(key)
    }
  }

  async getStats(): Promise<{
    totalObjects: number
    totalSize: number
  }> {
    const allObjects = await this.bucket.list()

    let totalSize = 0
    for (const obj of allObjects.objects) {
      totalSize += obj.size
    }

    return {
      totalObjects: allObjects.objects.length,
      totalSize,
    }
  }

  private getPublicUrlBase(): string {
    // Note: This assumes bucket is public and accessible at a known URL
    // In production, this should be configured via environment variable
    return process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://your-bucket.r2.cloudflarestorage.com'
  }
}
