/**
 * Unit Tests for Image Transformer Abstraction
 *
 * Tests the image transformer interface and implementations.
 */

import {
  NextjsImageTransformer,
  CloudflareImageTransformer,
  PassthroughImageTransformer,
  getImageTransformer,
  initializeImageTransformer,
  transformImage,
  getImageTransformerName,
  canOptimizeImage,
  type ImageTransformOptions,
} from '@root/lib/images'

describe('NextjsImageTransformer', () => {
  let transformer: NextjsImageTransformer

  beforeEach(() => {
    transformer = new NextjsImageTransformer()
  })

  describe('transform', () => {
    it('should return URL unchanged', () => {
      const url = '/images/hero.jpg'
      const result = transformer.transform(url)
      expect(result).toBe(url)
    })

    it('should return URL unchanged with options', () => {
      const url = '/images/hero.jpg'
      const options: ImageTransformOptions = {
        width: 1200,
        format: 'webp',
      }
      const result = transformer.transform(url, options)
      expect(result).toBe(url)
    })

    it('should work with external URLs', () => {
      const url = 'https://example.com/image.jpg'
      const result = transformer.transform(url)
      expect(result).toBe(url)
    })

    it('should handle URLs with query parameters', () => {
      const url = '/images/test.jpg?v=1'
      const result = transformer.transform(url)
      expect(result).toBe(url)
    })
  })

  describe('canOptimize', () => {
    it('should return true for local URLs', () => {
      expect(transformer.canOptimize()).toBe(true)
    })

    it('should return true for external URLs', () => {
      expect(transformer.canOptimize()).toBe(true)
    })

    it('should return true for any URL', () => {
      expect(transformer.canOptimize()).toBe(true)
    })
  })

  describe('getName', () => {
    it('should return Next.js', () => {
      expect(transformer.getName()).toBe('Next.js')
    })
  })
})

describe('CloudflareImageTransformer', () => {
  let transformer: CloudflareImageTransformer

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  describe('initialization', () => {
    it('should use provided CDN URL', () => {
      transformer = new CloudflareImageTransformer('https://cdn.example.com')
      expect(transformer.canOptimize('https://cdn.example.com/image.jpg')).toBe(true)
    })

    it('should use environment variable if no URL provided', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://mysite.com'
      transformer = new CloudflareImageTransformer()
      expect(transformer.canOptimize('https://mysite.com/image.jpg')).toBe(true)
    })

    it('should handle empty CDN URL', () => {
      transformer = new CloudflareImageTransformer('')
      expect(transformer.canOptimize('https://example.com/image.jpg')).toBe(false)
    })
  })

  describe('transform', () => {
    beforeEach(() => {
      transformer = new CloudflareImageTransformer('https://cdn.example.com')
    })

    it('should return URL unchanged if no options', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url)
      expect(result).toBe(url)
    })

    it('should add format parameter', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url, { format: 'webp' })
      expect(result).toContain('cf=format:webp')
    })

    it('should add width parameter', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url, { width: 1200 })
      expect(result).toContain('cf=width:1200')
    })

    it('should add height parameter', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url, { height: 800 })
      expect(result).toContain('cf=height:800')
    })

    it('should add fit parameter', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url, { fit: 'cover' })
      expect(result).toContain('cf=fit:cover')
    })

    it('should add quality parameter', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url, { quality: 85 })
      expect(result).toContain('cf=quality:85')
    })

    it('should add blur parameter', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url, { blur: 10 })
      expect(result).toContain('cf=blur:10')
    })

    it('should add greyscale parameter', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url, { greyscale: true })
      expect(result).toContain('cf=greyscale:true')
    })

    it('should add progressive parameter', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url, { progressive: true })
      expect(result).toContain('cf=progressive:true')
    })

    it('should combine multiple parameters', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url, {
        width: 1200,
        height: 800,
        format: 'webp',
        quality: 85,
      })

      expect(result).toContain('cf=')
      expect(result).toContain('format:webp')
      expect(result).toContain('width:1200')
      expect(result).toContain('height:800')
      expect(result).toContain('quality:85')
    })

    it('should use ? separator if no query parameters exist', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url, { width: 800 })
      expect(result).toContain('?cf=')
    })

    it('should use & separator if query parameters exist', () => {
      const url = 'https://cdn.example.com/image.jpg?v=1'
      const result = transformer.transform(url, { width: 800 })
      expect(result).toContain('&cf=')
      expect(result).toContain('v=1')
    })

    it('should skip options with falsy values', () => {
      const url = 'https://cdn.example.com/image.jpg'
      const result = transformer.transform(url, {
        format: 'webp',
        width: 0,
        greyscale: false,
      })

      expect(result).toContain('format:webp')
      expect(result).not.toContain('width:0')
      expect(result).not.toContain('greyscale')
    })

    it('should handle relative URLs', () => {
      transformer = new CloudflareImageTransformer('https://cdn.example.com')
      const url = '/images/hero.jpg'
      const result = transformer.transform(url, { width: 1200 })
      expect(result).toContain('cf=width:1200')
    })

    it('should return unchanged URL if cannot optimize', () => {
      transformer = new CloudflareImageTransformer('https://cdn.example.com')
      const url = 'https://other-cdn.com/image.jpg'
      const result = transformer.transform(url, { width: 1200 })
      expect(result).toBe(url)
    })
  })

  describe('canOptimize', () => {
    beforeEach(() => {
      transformer = new CloudflareImageTransformer('https://cdn.example.com')
    })

    it('should return true for CDN URLs', () => {
      expect(transformer.canOptimize('https://cdn.example.com/image.jpg')).toBe(true)
    })

    it('should return true for relative URLs', () => {
      expect(transformer.canOptimize('/images/test.jpg')).toBe(true)
    })

    it('should return true for HTTP URLs', () => {
      expect(transformer.canOptimize('http://cdn.example.com/image.jpg')).toBe(true)
    })

    it('should return false for external URLs when no CDN set', () => {
      transformer = new CloudflareImageTransformer('')
      expect(transformer.canOptimize('https://example.com/image.jpg')).toBe(false)
    })

    it('should return false for non-matching CDN URLs', () => {
      expect(transformer.canOptimize('https://other-cdn.com/image.jpg')).toBe(false)
    })
  })

  describe('getName', () => {
    it('should return Cloudflare', () => {
      transformer = new CloudflareImageTransformer()
      expect(transformer.getName()).toBe('Cloudflare')
    })
  })
})

describe('PassthroughImageTransformer', () => {
  let transformer: PassthroughImageTransformer

  beforeEach(() => {
    transformer = new PassthroughImageTransformer()
  })

  describe('transform', () => {
    it('should return URL unchanged', () => {
      const url = '/images/hero.jpg'
      const result = transformer.transform(url)
      expect(result).toBe(url)
    })

    it('should return URL unchanged with options', () => {
      const url = 'https://example.com/image.jpg'
      const result = transformer.transform(url)
      expect(result).toBe(url)
    })

    it('should handle empty URLs', () => {
      const result = transformer.transform('')
      expect(result).toBe('')
    })
  })

  describe('canOptimize', () => {
    it('should return true for any URL', () => {
      expect(transformer.canOptimize()).toBe(true)
    })
  })

  describe('getName', () => {
    it('should return Passthrough (no optimization)', () => {
      expect(transformer.getName()).toBe('Passthrough (no optimization)')
    })
  })
})

describe('Global Image Transformer', () => {
  beforeEach(() => {
    // Reset to default state
    initializeImageTransformer(new NextjsImageTransformer())
  })

  describe('initializeImageTransformer', () => {
    it('should set the global transformer', () => {
      const customTransformer = new PassthroughImageTransformer()
      initializeImageTransformer(customTransformer)

      const retrieved = getImageTransformer()
      expect(retrieved).toBe(customTransformer)
    })

    it('should allow switching transformers', () => {
      initializeImageTransformer(new NextjsImageTransformer())
      expect(getImageTransformer().getName()).toBe('Next.js')

      initializeImageTransformer(new CloudflareImageTransformer())
      expect(getImageTransformer().getName()).toBe('Cloudflare')

      initializeImageTransformer(new PassthroughImageTransformer())
      expect(getImageTransformer().getName()).toBe('Passthrough (no optimization)')
    })
  })

  describe('getImageTransformer', () => {
    it('should return initialized transformer', () => {
      const transformer = getImageTransformer()
      expect(transformer).toBeDefined()
    })

    it('should return same instance on subsequent calls', () => {
      const t1 = getImageTransformer()
      const t2 = getImageTransformer()
      expect(t1).toBe(t2)
    })

    it('should fall back to NextjsImageTransformer if not initialized', () => {
      const transformer = getImageTransformer()
      expect(transformer).toBeInstanceOf(NextjsImageTransformer)
    })
  })

  describe('transformImage', () => {
    it('should use global transformer', () => {
      initializeImageTransformer(new PassthroughImageTransformer())

      const url = 'https://example.com/image.jpg'
      const result = transformImage(url, { width: 1200 })

      expect(result).toBe(url)
    })

    it('should pass options to transformer', () => {
      initializeImageTransformer(new CloudflareImageTransformer('https://cdn.example.com'))

      const url = 'https://cdn.example.com/image.jpg'
      const result = transformImage(url, { width: 800, format: 'webp' })

      expect(result).toContain('cf=')
      expect(result).toContain('width:800')
      expect(result).toContain('format:webp')
    })

    it('should work with no options', () => {
      const url = '/images/test.jpg'
      const result = transformImage(url)
      expect(result).toBe(url)
    })
  })

  describe('getImageTransformerName', () => {
    it('should return name from global transformer', () => {
      initializeImageTransformer(new NextjsImageTransformer())
      expect(getImageTransformerName()).toBe('Next.js')

      initializeImageTransformer(new CloudflareImageTransformer())
      expect(getImageTransformerName()).toBe('Cloudflare')

      initializeImageTransformer(new PassthroughImageTransformer())
      expect(getImageTransformerName()).toBe('Passthrough (no optimization)')
    })
  })

  describe('canOptimizeImage', () => {
    it('should check optimization support with global transformer', () => {
      initializeImageTransformer(new NextjsImageTransformer())
      expect(canOptimizeImage('any-url')).toBe(true)
    })

    it('should work with Cloudflare transformer', () => {
      initializeImageTransformer(new CloudflareImageTransformer('https://cdn.example.com'))
      expect(canOptimizeImage('https://cdn.example.com/image.jpg')).toBe(true)
      expect(canOptimizeImage('https://other.com/image.jpg')).toBe(false)
    })

    it('should work with Passthrough transformer', () => {
      initializeImageTransformer(new PassthroughImageTransformer())
      expect(canOptimizeImage('any-url')).toBe(true)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle transformation pipeline', () => {
      initializeImageTransformer(new CloudflareImageTransformer('https://cdn.example.com'))

      const imageUrl = 'https://cdn.example.com/hero.jpg'

      // Check if can optimize
      expect(canOptimizeImage(imageUrl)).toBe(true)

      // Transform with options
      const transformed = transformImage(imageUrl, {
        width: 1200,
        height: 600,
        format: 'webp',
        quality: 85,
      })

      // Verify transformation was applied
      expect(transformed).toContain('cf=')
      expect(transformed).toContain('width:1200')
      expect(transformed).toContain('height:600')
      expect(transformed).toContain('format:webp')
      expect(transformed).toContain('quality:85')

      // Verify transformer name
      expect(getImageTransformerName()).toBe('Cloudflare')
    })

    it('should allow fallback when optimization unavailable', () => {
      initializeImageTransformer(new CloudflareImageTransformer('https://cdn.example.com'))

      const externalUrl = 'https://external-cdn.com/image.jpg'

      // Cannot optimize external URL
      expect(canOptimizeImage(externalUrl)).toBe(false)

      // Transform returns URL unchanged
      const result = transformImage(externalUrl, { width: 1200 })
      expect(result).toBe(externalUrl)
    })

    it('should support transformer switching', () => {
      const imageUrl = '/images/test.jpg'

      // Start with Next.js
      initializeImageTransformer(new NextjsImageTransformer())
      expect(getImageTransformerName()).toBe('Next.js')
      expect(transformImage(imageUrl)).toBe(imageUrl)

      // Switch to Cloudflare
      initializeImageTransformer(
        new CloudflareImageTransformer('https://cdn.example.com'),
      )
      expect(getImageTransformerName()).toBe('Cloudflare')
      const cfResult = transformImage(imageUrl, { width: 800 })
      expect(cfResult).toContain('cf=')

      // Switch to Passthrough
      initializeImageTransformer(new PassthroughImageTransformer())
      expect(getImageTransformerName()).toBe('Passthrough (no optimization)')
      expect(transformImage(imageUrl)).toBe(imageUrl)
    })

    it('should handle complex transformation options', () => {
      initializeImageTransformer(
        new CloudflareImageTransformer('https://assets.example.com'),
      )

      const options: ImageTransformOptions = {
        width: 1920,
        height: 1080,
        fit: 'cover',
        format: 'webp',
        quality: 80,
        blur: 5,
        greyscale: true,
        progressive: true,
      }

      const url = 'https://assets.example.com/banner.jpg'
      const result = transformImage(url, options)

      // Verify all options were applied
      expect(result).toContain('width:1920')
      expect(result).toContain('height:1080')
      expect(result).toContain('fit:cover')
      expect(result).toContain('format:webp')
      expect(result).toContain('quality:80')
      expect(result).toContain('blur:5')
      expect(result).toContain('greyscale:true')
      expect(result).toContain('progressive:true')
    })
  })
})
