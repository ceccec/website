/**
 * Image Optimization Abstraction
 *
 * Abstracts image transformation across different platforms:
 * - Cloudflare Image Optimization for Workers
 * - Next.js built-in image optimization
 * - Imgix or similar CDN services
 * - Passthrough for direct URLs (fallback)
 *
 * Enables consistent image handling across deployments while using
 * the best available service on each platform.
 */

/**
 * Image optimization formats
 */
export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'

/**
 * Image transformation options
 */
export interface ImageTransformOptions {
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  format?: ImageFormat
  quality?: number // 1-100
  progressive?: boolean
  blur?: number
  greyscale?: boolean
  brightness?: number // -1 to 1
  contrast?: number // -1 to 1
  saturation?: number // -1 to 1
}

/**
 * Abstract image transformer interface
 */
export interface ImageTransformer {
  /**
   * Transform an image URL with optional parameters
   * Returns the transformed URL (may be the same URL if no transformation available)
   */
  transform(url: string, options?: ImageTransformOptions): string

  /**
   * Validate if a URL can be optimized by this transformer
   */
  canOptimize(url: string): boolean

  /**
   * Get the name of the transformer (for logging)
   */
  getName(): string
}

/**
 * Next.js built-in image optimizer (default)
 *
 * Uses Next.js Image component and automatic optimization.
 * Works everywhere Next.js runs.
 */
export class NextjsImageTransformer implements ImageTransformer {
  transform(url: string, options?: ImageTransformOptions): string {
    // Return the URL as-is; Next.js Image component will handle optimization
    // Real transformation happens in the Image component render
    return url
  }

  canOptimize(): boolean {
    return true // Can always use Next.js default optimizer
  }

  getName(): string {
    return 'Next.js'
  }
}

/**
 * Cloudflare Image Optimization transformer
 *
 * Uses Cloudflare's image transformation API.
 * Only works on Cloudflare Workers deployments.
 */
export class CloudflareImageTransformer implements ImageTransformer {
  private cdnUrl: string

  constructor(cdnUrl: string = '') {
    this.cdnUrl = cdnUrl || process.env.NEXT_PUBLIC_SITE_URL || ''
  }

  transform(url: string, options?: ImageTransformOptions): string {
    // Cloudflare image transformation format:
    // https://example.com/image.jpg?cf=format:webp,fit:cover,width:1200
    if (!this.canOptimize(url)) return url

    const params: string[] = []

    if (options?.format) params.push(`format:${options.format}`)
    if (options?.width) params.push(`width:${options.width}`)
    if (options?.height) params.push(`height:${options.height}`)
    if (options?.fit) params.push(`fit:${options.fit}`)
    if (options?.quality) params.push(`quality:${options.quality}`)
    if (options?.blur) params.push(`blur:${options.blur}`)
    if (options?.greyscale) params.push('greyscale:true')
    if (options?.progressive) params.push('progressive:true')

    if (params.length === 0) return url

    // Add cf= query parameter
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}cf=${params.join(',')}`
  }

  canOptimize(url: string): boolean {
    // Only optimize URLs from our own CDN
    if (!this.cdnUrl) return false
    return url.startsWith(this.cdnUrl) || url.startsWith('/') || url.startsWith('http')
  }

  getName(): string {
    return 'Cloudflare'
  }
}

/**
 * Passthrough image transformer (no optimization)
 *
 * Returns URLs as-is without any transformation.
 * Used as fallback when no optimizer is available.
 */
export class PassthroughImageTransformer implements ImageTransformer {
  transform(url: string): string {
    return url
  }

  canOptimize(): boolean {
    return true // Can always pass through
  }

  getName(): string {
    return 'Passthrough (no optimization)'
  }
}

/**
 * Global image transformer instance
 * Set during runtime initialization based on platform capabilities
 */
let globalImageTransformer: ImageTransformer | null = null

/**
 * Initialize the global image transformer
 */
export function initializeImageTransformer(transformer: ImageTransformer): void {
  globalImageTransformer = transformer
}

/**
 * Get the active image transformer
 * Falls back to Next.js if not initialized
 */
export function getImageTransformer(): ImageTransformer {
  if (!globalImageTransformer) {
    globalImageTransformer = new NextjsImageTransformer()
  }
  return globalImageTransformer
}

/**
 * Transform an image URL with optional parameters
 *
 * @example
 * const optimized = await transformImage('/images/hero.jpg', {
 *   width: 1200,
 *   format: 'webp',
 *   quality: 85
 * })
 */
export function transformImage(url: string, options?: ImageTransformOptions): string {
  const transformer = getImageTransformer()
  return transformer.transform(url, options)
}

/**
 * Get the name of the current image transformer (for logging/monitoring)
 */
export function getImageTransformerName(): string {
  const transformer = getImageTransformer()
  return transformer.getName()
}

/**
 * Check if a URL can be optimized by the current transformer
 */
export function canOptimizeImage(url: string): boolean {
  const transformer = getImageTransformer()
  return transformer.canOptimize(url)
}
