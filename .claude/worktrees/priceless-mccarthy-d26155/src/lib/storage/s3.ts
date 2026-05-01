/**
 * S3 / S3-Compatible Storage Backend
 *
 * Uses AWS S3 or S3-compatible services (MinIO, DigitalOcean Spaces, etc)
 * for object storage on Docker and self-hosted deployments.
 */

import type { StorageBackend, StorageOptions } from '.'

/**
 * S3 Storage Backend implementation
 *
 * Works with:
 * - AWS S3
 * - MinIO (local S3-compatible)
 * - DigitalOcean Spaces
 * - Wasabi
 * - Any S3-compatible API
 */
export class S3StorageBackend implements StorageBackend {
  private s3Client: any
  private bucket: string
  private region: string

  constructor(s3Client: any, bucket: string, region: string = 'us-east-1') {
    this.s3Client = s3Client
    this.bucket = bucket
    this.region = region
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3Client.headObject({
        Bucket: this.bucket,
        Key: key,
      })
      return true
    } catch (err: any) {
      if (err.code === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false
      }
      throw err
    }
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const response = await this.s3Client.getObject({
        Bucket: this.bucket,
        Key: key,
      })
      return Buffer.from(await response.Body.transformToByteArray())
    } catch (err: any) {
      if (err.code === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        return null
      }
      throw err
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
      const response = await this.s3Client.headObject({
        Bucket: this.bucket,
        Key: key,
      })
      return {
        size: response.ContentLength || 0,
        modified: response.LastModified || new Date(),
        contentType: response.ContentType,
      }
    } catch (err: any) {
      if (err.code === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return null
      }
      throw err
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

    await this.s3Client.putObject({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: options?.contentType,
      CacheControl: options?.cacheControl,
      Metadata: options?.metadata,
    })

    const url = this.getPublicUrlForKey(key)
    return { url }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3Client.deleteObject({
        Bucket: this.bucket,
        Key: key,
      })
    } catch (err) {
      // Silently ignore; object may not exist
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return

    await this.s3Client.deleteObjects({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    })
  }

  async list(prefix?: string): Promise<string[]> {
    const keys: string[] = []
    let continuationToken: string | undefined

    do {
      const response = await this.s3Client.listObjectsV2({
        Bucket: this.bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })

      if (response.Contents) {
        keys.push(...response.Contents.map((obj: any) => obj.Key))
      }

      continuationToken = response.NextContinuationToken
    } while (continuationToken)

    return keys
  }

  async getPublicUrl(key: string): Promise<string> {
    return this.getPublicUrlForKey(key)
  }

  async getSignedUrl(key: string, expirationSeconds: number = 3600): Promise<string> {
    try {
      const command = {
        Bucket: this.bucket,
        Key: key,
      }
      // Note: This requires @aws-sdk/s3-request-presigner
      // For now, return public URL as fallback
      return this.getPublicUrlForKey(key)
    } catch (err) {
      // Fallback to public URL
      return this.getPublicUrlForKey(key)
    }
  }

  async getStats(): Promise<{
    totalObjects: number
    totalSize: number
  }> {
    const keys = await this.list()

    let totalSize = 0
    for (const key of keys) {
      const metadata = await this.getMetadata(key)
      if (metadata) {
        totalSize += metadata.size
      }
    }

    return {
      totalObjects: keys.length,
      totalSize,
    }
  }

  private getPublicUrlForKey(key: string): string {
    const endpoint = process.env.S3_ENDPOINT || `https://s3.${this.region}.amazonaws.com`
    const publicUrl = process.env.S3_PUBLIC_URL
    if (publicUrl) {
      return `${publicUrl}/${key}`
    }
    return `${endpoint}/${this.bucket}/${key}`
  }
}
