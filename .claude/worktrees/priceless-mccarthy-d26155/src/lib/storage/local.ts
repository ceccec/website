/**
 * Local Filesystem Storage Backend
 *
 * Uses the local filesystem for object storage.
 * Ideal for Docker development and testing.
 * NOT recommended for production (use R2, Blob, or S3 instead).
 */

import type { StorageBackend, StorageOptions } from '.'
import * as fs from 'fs/promises'
import * as path from 'path'

/**
 * Local Filesystem Storage Backend implementation
 *
 * Stores files in a configurable directory on the local filesystem.
 * Creates subdirectories as needed.
 *
 * WARNING: Not suitable for production or multi-container setups.
 * Data is local to a single machine/container.
 */
export class LocalStorageBackend implements StorageBackend {
  private basePath: string

  constructor(basePath: string = './uploads') {
    this.basePath = basePath
  }

  private getFullPath(key: string): string {
    return path.join(this.basePath, key)
  }

  private async ensureDir(filePath: string): Promise<void> {
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.getFullPath(key))
      return true
    } catch {
      return false
    }
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(this.getFullPath(key))
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
      const filePath = this.getFullPath(key)
      const stats = await fs.stat(filePath)

      return {
        size: stats.size,
        modified: stats.mtime,
        contentType: this.guessContentType(key),
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
    const filePath = this.getFullPath(key)
    await this.ensureDir(filePath)

    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    await fs.writeFile(filePath, buffer)

    // Return a relative URL or localhost URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const url = `${baseUrl}/uploads/${key}`

    return { url }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = this.getFullPath(key)
      await fs.unlink(filePath)

      // Clean up empty directories
      let dir = path.dirname(filePath)
      while (dir !== this.basePath) {
        try {
          const files = await fs.readdir(dir)
          if (files.length === 0) {
            await fs.rmdir(dir)
            dir = path.dirname(dir)
          } else {
            break
          }
        } catch {
          break
        }
      }
    } catch (err) {
      // Silently ignore; file may not exist
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.delete(key)
    }
  }

  async list(prefix?: string): Promise<string[]> {
    const keys: string[] = []

    const walk = async (dir: string, basePrefix: string = ''): Promise<void> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = path.join(basePrefix, entry.name)

          if (!prefix || fullPath.startsWith(prefix)) {
            if (entry.isFile()) {
              keys.push(fullPath)
            } else if (entry.isDirectory()) {
              await walk(path.join(dir, entry.name), fullPath)
            }
          }
        }
      } catch (err) {
        // Directory doesn't exist yet
      }
    }

    const searchDir = prefix ? path.join(this.basePath, prefix) : this.basePath
    await walk(searchDir)

    return keys
  }

  async getPublicUrl(key: string): Promise<string> {
    // Return a URL that can be served by Next.js public folder or a static server
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return `${baseUrl}/uploads/${key}`
  }

  async getSignedUrl(key: string): Promise<string> {
    // Local filesystem doesn't support signed URLs; return public URL
    return this.getPublicUrl(key)
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

  private guessContentType(filename: string): string | undefined {
    const ext = path.extname(filename).toLowerCase()

    const mimeTypes: Record<string, string> = {
      '.json': 'application/json',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
    }

    return mimeTypes[ext]
  }
}
