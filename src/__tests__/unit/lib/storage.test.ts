/**
 * Unit Tests for Storage Backend Abstraction
 *
 * Tests the storage backend interface and implementations.
 */

import {
  MemoryStorageBackend,
  getStorageBackend,
  initializeStorageBackend,
  storeFile,
  retrieveFile,
  getFileUrl,
  deleteFile,
  deleteFiles,
  getStorageStats,
  MIME_TYPES,
} from '@root/lib/storage'

describe('MemoryStorageBackend', () => {
  let backend: MemoryStorageBackend

  beforeEach(() => {
    backend = new MemoryStorageBackend()
  })

  describe('exists', () => {
    it('should return false for non-existent key', async () => {
      const result = await backend.exists('non-existent')
      expect(result).toBe(false)
    })

    it('should return true after putting an object', async () => {
      await backend.put('test-key', 'test data')
      const result = await backend.exists('test-key')
      expect(result).toBe(true)
    })

    it('should return false after deleting an object', async () => {
      await backend.put('test-key', 'test data')
      await backend.delete('test-key')
      const result = await backend.exists('test-key')
      expect(result).toBe(false)
    })
  })

  describe('get/put', () => {
    it('should return null for non-existent key', async () => {
      const result = await backend.get('missing')
      expect(result).toBeNull()
    })

    it('should store and retrieve string data', async () => {
      const testData = 'hello world'
      await backend.put('string-key', testData)
      const result = await backend.get('string-key')

      expect(result).toBeInstanceOf(Buffer)
      expect(result?.toString()).toBe(testData)
    })

    it('should store and retrieve buffer data', async () => {
      const testData = Buffer.from('binary data')
      await backend.put('buffer-key', testData)
      const result = await backend.get('buffer-key')

      expect(result).toEqual(testData)
    })

    it('should overwrite existing key', async () => {
      await backend.put('overwrite-key', 'original')
      await backend.put('overwrite-key', 'updated')
      const result = await backend.get('overwrite-key')

      expect(result?.toString()).toBe('updated')
    })

    it('should handle empty data', async () => {
      await backend.put('empty-key', '')
      const result = await backend.get('empty-key')

      expect(result).toBeInstanceOf(Buffer)
      expect(result?.length).toBe(0)
    })

    it('should return URL from put operation', async () => {
      const result = await backend.put('test-url', 'data')
      expect(result.url).toBe('memory://test-url')
    })

    it('should store contentType in options', async () => {
      await backend.put('json-key', '{}', {
        contentType: MIME_TYPES.JSON,
      })
      const metadata = await backend.getMetadata('json-key')

      expect(metadata?.contentType).toBe(MIME_TYPES.JSON)
    })

    it('should handle keys with paths', async () => {
      const testData = 'nested data'
      await backend.put('uploads/media/image.jpg', testData)
      const result = await backend.get('uploads/media/image.jpg')

      expect(result?.toString()).toBe(testData)
    })
  })

  describe('getMetadata', () => {
    it('should return null for non-existent key', async () => {
      const result = await backend.getMetadata('missing')
      expect(result).toBeNull()
    })

    it('should return size of stored data', async () => {
      const testData = 'test data'
      await backend.put('size-key', testData)
      const metadata = await backend.getMetadata('size-key')

      expect(metadata?.size).toBe(testData.length)
    })

    it('should return modified date', async () => {
      await backend.put('date-key', 'data')
      const before = new Date()
      const metadata = await backend.getMetadata('date-key')
      const after = new Date()

      expect(metadata?.modified).toBeInstanceOf(Date)
      expect(metadata!.modified.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(metadata!.modified.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should include contentType if provided', async () => {
      await backend.put('typed-key', 'data', {
        contentType: MIME_TYPES.PNG,
      })
      const metadata = await backend.getMetadata('typed-key')

      expect(metadata?.contentType).toBe(MIME_TYPES.PNG)
    })

    it('should have undefined contentType if not provided', async () => {
      await backend.put('untyped-key', 'data')
      const metadata = await backend.getMetadata('untyped-key')

      expect(metadata?.contentType).toBeUndefined()
    })

    it('should track size of buffer data', async () => {
      const buffer = Buffer.alloc(1024)
      await backend.put('buffer-size', buffer)
      const metadata = await backend.getMetadata('buffer-size')

      expect(metadata?.size).toBe(1024)
    })
  })

  describe('delete', () => {
    it('should remove stored object', async () => {
      await backend.put('delete-key', 'data')
      expect(await backend.exists('delete-key')).toBe(true)

      await backend.delete('delete-key')
      expect(await backend.exists('delete-key')).toBe(false)
    })

    it('should succeed silently for non-existent key', async () => {
      await expect(backend.delete('non-existent')).resolves.not.toThrow()
    })

    it('should be idempotent', async () => {
      await backend.put('idempotent-key', 'data')
      await backend.delete('idempotent-key')
      await backend.delete('idempotent-key')

      expect(await backend.exists('idempotent-key')).toBe(false)
    })
  })

  describe('deleteMany', () => {
    it('should delete multiple objects', async () => {
      const keys = ['key1', 'key2', 'key3']
      for (const key of keys) {
        await backend.put(key, 'data')
      }

      await backend.deleteMany(keys)

      for (const key of keys) {
        expect(await backend.exists(key)).toBe(false)
      }
    })

    it('should handle empty array', async () => {
      await expect(backend.deleteMany([])).resolves.not.toThrow()
    })

    it('should handle mixed existing and non-existent keys', async () => {
      await backend.put('exists', 'data')
      await backend.deleteMany(['exists', 'does-not-exist'])

      expect(await backend.exists('exists')).toBe(false)
    })

    it('should handle paths in keys', async () => {
      const keys = ['uploads/file1.txt', 'uploads/file2.txt']
      for (const key of keys) {
        await backend.put(key, 'data')
      }

      await backend.deleteMany(keys)

      for (const key of keys) {
        expect(await backend.exists(key)).toBe(false)
      }
    })
  })

  describe('list', () => {
    beforeEach(async () => {
      await backend.put('file1.txt', 'data1')
      await backend.put('file2.txt', 'data2')
      await backend.put('uploads/image.jpg', 'data3')
      await backend.put('uploads/avatar.png', 'data4')
    })

    it('should return empty array initially', async () => {
      const freshBackend = new MemoryStorageBackend()
      const list = await freshBackend.list()
      expect(list).toEqual([])
    })

    it('should list all keys without prefix', async () => {
      const list = await backend.list()
      expect(list).toHaveLength(4)
      expect(list).toEqual(
        expect.arrayContaining([
          'file1.txt',
          'file2.txt',
          'uploads/image.jpg',
          'uploads/avatar.png',
        ]),
      )
    })

    it('should filter by prefix', async () => {
      const list = await backend.list('uploads/')
      expect(list).toHaveLength(2)
      expect(list).toEqual(
        expect.arrayContaining(['uploads/image.jpg', 'uploads/avatar.png']),
      )
    })

    it('should return empty array for non-matching prefix', async () => {
      const list = await backend.list('non-existent/')
      expect(list).toEqual([])
    })

    it('should handle prefix with no trailing slash', async () => {
      const list = await backend.list('uploads')
      expect(list).toHaveLength(2)
    })

    it('should be exact prefix match', async () => {
      await backend.put('file1-backup.txt', 'data')
      const list = await backend.list('file1')
      expect(list).toEqual([])
    })
  })

  describe('getPublicUrl', () => {
    it('should return memory:// URL', async () => {
      await backend.put('public-key', 'data')
      const url = await backend.getPublicUrl('public-key')

      expect(url).toBe('memory://public-key')
    })

    it('should work for non-existent keys', async () => {
      const url = await backend.getPublicUrl('non-existent')
      expect(url).toBe('memory://non-existent')
    })

    it('should preserve key path structure', async () => {
      const url = await backend.getPublicUrl('uploads/media/file.jpg')
      expect(url).toBe('memory://uploads/media/file.jpg')
    })
  })

  describe('getSignedUrl', () => {
    it('should return memory:// URL', async () => {
      await backend.put('signed-key', 'data')
      const url = await backend.getSignedUrl('signed-key')

      expect(url).toBe('memory://signed-key')
    })

    it('should work without expiration parameter', async () => {
      const url = await backend.getSignedUrl('key')
      expect(url).toBe('memory://key')
    })

    it('should ignore expiration seconds parameter', async () => {
      const url = await backend.getSignedUrl('key')
      expect(url).toBe('memory://key')
    })

    it('should preserve key structure', async () => {
      const url = await backend.getSignedUrl('secure/download/file.pdf')
      expect(url).toBe('memory://secure/download/file.pdf')
    })
  })

  describe('getStats', () => {
    it('should return zero initially', async () => {
      const freshBackend = new MemoryStorageBackend()
      const stats = await freshBackend.getStats()

      expect(stats.totalObjects).toBe(0)
      expect(stats.totalSize).toBe(0)
    })

    it('should track object count', async () => {
      await backend.put('obj1', 'data1')
      await backend.put('obj2', 'data2')
      const stats = await backend.getStats()

      expect(stats.totalObjects).toBe(2)
    })

    it('should track total size', async () => {
      const data1 = 'hello' // 5 bytes
      const data2 = 'world' // 5 bytes
      await backend.put('obj1', data1)
      await backend.put('obj2', data2)
      const stats = await backend.getStats()

      expect(stats.totalSize).toBe(10)
    })

    it('should update count after deletion', async () => {
      await backend.put('obj1', 'data')
      await backend.put('obj2', 'data')
      await backend.delete('obj1')
      const stats = await backend.getStats()

      expect(stats.totalObjects).toBe(1)
    })

    it('should update size after deletion', async () => {
      const testData = 'data' // 4 bytes
      await backend.put('obj1', testData)
      await backend.put('obj2', testData)
      await backend.delete('obj1')
      const stats = await backend.getStats()

      expect(stats.totalSize).toBe(4)
    })

    it('should handle large buffers', async () => {
      const largeBuffer = Buffer.alloc(1024 * 1024) // 1MB
      await backend.put('large', largeBuffer)
      const stats = await backend.getStats()

      expect(stats.totalObjects).toBe(1)
      expect(stats.totalSize).toBe(1024 * 1024)
    })

    it('should aggregate size correctly with mixed data types', async () => {
      await backend.put('string-key', 'hello') // 5 bytes
      await backend.put('buffer-key', Buffer.from('world')) // 5 bytes
      const stats = await backend.getStats()

      expect(stats.totalObjects).toBe(2)
      expect(stats.totalSize).toBe(10)
    })
  })
})

describe('Global Storage Backend', () => {
  beforeEach(() => {
    // Reset backend for each test
    initializeStorageBackend(new MemoryStorageBackend())
  })

  describe('initializeStorageBackend', () => {
    it('should set the global backend', async () => {
      const customBackend = new MemoryStorageBackend()
      initializeStorageBackend(customBackend)

      const retrieved = getStorageBackend()
      expect(retrieved).toBe(customBackend)
    })
  })

  describe('getStorageBackend', () => {
    it('should return initialized backend', async () => {
      const backend = getStorageBackend()
      expect(backend).toBeDefined()
    })

    it('should return same instance on subsequent calls', async () => {
      const backend1 = getStorageBackend()
      const backend2 = getStorageBackend()
      expect(backend1).toBe(backend2)
    })

    it('should fall back to MemoryStorageBackend if not initialized', async () => {
      // Simulate uninitialized state by creating new backend
      const backend = new MemoryStorageBackend()
      initializeStorageBackend(backend)

      const retrieved = getStorageBackend()
      expect(retrieved).toBeInstanceOf(MemoryStorageBackend)
    })
  })

  describe('storeFile', () => {
    it('should store file and return URL', async () => {
      const url = await storeFile('test-file.txt', 'test data')
      expect(url).toBe('memory://test-file.txt')
    })

    it('should pass through content type', async () => {
      await storeFile('image.jpg', 'fake-image-data', {
        contentType: MIME_TYPES.JPEG,
      })

      const backend = getStorageBackend()
      const metadata = await backend.getMetadata('image.jpg')
      expect(metadata?.contentType).toBe(MIME_TYPES.JPEG)
    })

    it('should handle buffer input', async () => {
      const buffer = Buffer.from('binary data')
      const url = await storeFile('binary-file', buffer)
      expect(url).toContain('memory://')
    })
  })

  describe('retrieveFile', () => {
    it('should return null for missing file', async () => {
      const result = await retrieveFile('missing')
      expect(result).toBeNull()
    })

    it('should retrieve stored file', async () => {
      const testData = 'test content'
      await storeFile('retrieve-test', testData)

      const result = await retrieveFile('retrieve-test')
      expect(result?.toString()).toBe(testData)
    })
  })

  describe('getFileUrl', () => {
    it('should return public URL', async () => {
      await storeFile('url-test', 'data')
      const url = await getFileUrl('url-test')

      expect(url).toBe('memory://url-test')
    })
  })

  describe('deleteFile', () => {
    it('should delete stored file', async () => {
      await storeFile('delete-test', 'data')
      expect(await retrieveFile('delete-test')).not.toBeNull()

      await deleteFile('delete-test')
      expect(await retrieveFile('delete-test')).toBeNull()
    })

    it('should succeed silently for missing file', async () => {
      await expect(deleteFile('non-existent')).resolves.not.toThrow()
    })
  })

  describe('deleteFiles', () => {
    it('should delete multiple files', async () => {
      const files = ['file1', 'file2', 'file3']
      for (const file of files) {
        await storeFile(file, 'data')
      }

      await deleteFiles(files)

      for (const file of files) {
        expect(await retrieveFile(file)).toBeNull()
      }
    })

    it('should handle empty array', async () => {
      await expect(deleteFiles([])).resolves.not.toThrow()
    })
  })

  describe('getStorageStats', () => {
    it('should return stats from current backend', async () => {
      await storeFile('stat1', 'data1')
      await storeFile('stat2', 'data2')

      const stats = await getStorageStats()

      expect(stats.totalObjects).toBe(2)
      expect(stats.totalSize).toBeGreaterThan(0)
    })

    it('should reflect deletions', async () => {
      await storeFile('temp1', 'data')
      await storeFile('temp2', 'data')
      await deleteFile('temp1')

      const stats = await getStorageStats()
      expect(stats.totalObjects).toBe(1)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle file lifecycle: store, retrieve, delete', async () => {
      const key = 'lifecycle-test'
      const data = 'lifecycle data'

      // Store
      const url = await storeFile(key, data)
      expect(url).toBe(`memory://${key}`)

      // Retrieve
      const retrieved = await retrieveFile(key)
      expect(retrieved?.toString()).toBe(data)

      // Get URL
      const publicUrl = await getFileUrl(key)
      expect(publicUrl).toBe(`memory://${key}`)

      // Delete
      await deleteFile(key)
      expect(await retrieveFile(key)).toBeNull()
    })

    it('should handle bulk operations', async () => {
      const keys = ['bulk1', 'bulk2', 'bulk3']

      // Store multiple
      for (const key of keys) {
        await storeFile(key, `data for ${key}`)
      }

      // Verify all exist
      for (const key of keys) {
        expect(await retrieveFile(key)).not.toBeNull()
      }

      // Delete all
      await deleteFiles(keys)

      // Verify all gone
      for (const key of keys) {
        expect(await retrieveFile(key)).toBeNull()
      }
    })

    it('should track stats across operations', async () => {
      let stats = await getStorageStats()
      expect(stats.totalObjects).toBe(0)

      await storeFile('tracked1', 'data')
      stats = await getStorageStats()
      expect(stats.totalObjects).toBe(1)

      await storeFile('tracked2', 'data')
      stats = await getStorageStats()
      expect(stats.totalObjects).toBe(2)

      await deleteFile('tracked1')
      stats = await getStorageStats()
      expect(stats.totalObjects).toBe(1)
    })
  })
})
