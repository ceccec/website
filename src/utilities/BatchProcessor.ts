/**
 * Unified batch processing utility supporting multiple strategies:
 * - Sequential: Process items one-by-one (safest, slowest)
 * - Parallel: Process all items concurrently with a concurrency limit (faster)
 * - Segmented: Process items in fixed-size batches sequentially (balanced)
 */

export type BatchMode = 'sequential' | 'parallel' | 'segmented'

export interface BatchConfig {
  /** Processing mode (default: 'sequential') */
  mode?: BatchMode
  /** Segment size for 'segmented' mode (default: 10) */
  segmentSize?: number
  /** Max concurrent promises for 'parallel' mode (default: 5) */
  concurrency?: number
  /** Progress callback: (processed, total) */
  onProgress?: (processed: number, total: number) => void
  /** Log processing details (default: true) */
  enableLogging?: boolean
}

/**
 * Process an array of items with configurable batch strategy.
 * Failed items return null; successful items return the processor result.
 *
 * @param items - Array of items to process
 * @param processor - Async function to process each item
 * @param config - Configuration for batch processing
 * @returns Array of results (null for failed items)
 *
 * @example
 * // Sequential processing
 * const results = await processBatch(items, async (item) => {
 *   return await payload.create({ collection: 'docs', data: item })
 * }, { mode: 'sequential' })
 *
 * @example
 * // Segmented processing with progress
 * const results = await processBatch(items, processor, {
 *   mode: 'segmented',
 *   segmentSize: 10,
 *   onProgress: (done, total) => console.log(`${done}/${total}`)
 * })
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  config?: BatchConfig,
): Promise<(R | null)[]> {
  const mode = config?.mode ?? 'sequential'
  const enableLogging = config?.enableLogging !== false

  if (enableLogging) {
    console.log(`[BatchProcessor] Processing ${items.length} items in ${mode} mode`)
  }

  switch (mode) {
    case 'sequential':
      return processSequential(items, processor, config?.onProgress, enableLogging)
    case 'parallel':
      return processParallel(
        items,
        processor,
        config?.concurrency ?? 5,
        config?.onProgress,
        enableLogging,
      )
    case 'segmented':
      return processSegmented(
        items,
        processor,
        config?.segmentSize ?? 10,
        config?.onProgress,
        enableLogging,
      )
    default:
      throw new Error(`Unknown batch mode: ${mode}`)
  }
}

/**
 * Process items one-by-one, in order. Safest for database operations.
 */
async function processSequential<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  onProgress?: (processed: number, total: number) => void,
  enableLogging?: boolean,
): Promise<(R | null)[]> {
  const results: (R | null)[] = []

  for (let i = 0; i < items.length; i++) {
    try {
      const result = await processor(items[i], i)
      results.push(result)
    } catch (error) {
      if (enableLogging) {
        console.error(`[BatchProcessor] Item ${i} failed:`, error instanceof Error ? error.message : error)
      }
      results.push(null)
    }

    onProgress?.(i + 1, items.length)
  }

  if (enableLogging) {
    const successful = results.filter((r) => r !== null).length
    console.log(`[BatchProcessor] Completed: ${successful}/${items.length} successful`)
  }

  return results
}

/**
 * Process items in parallel with a concurrency limit. Faster but uses more resources.
 */
async function processParallel<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  concurrency: number,
  onProgress?: (processed: number, total: number) => void,
  enableLogging?: boolean,
): Promise<(R | null)[]> {
  const results: (R | null)[] = new Array(items.length).fill(null)
  const inProgress = new Set<Promise<void>>()
  let completed = 0

  for (let i = 0; i < items.length; i++) {
    const promise = (async () => {
      try {
        const result = await processor(items[i], i)
        results[i] = result
      } catch (error) {
        if (enableLogging) {
          console.error(`[BatchProcessor] Item ${i} failed:`, error instanceof Error ? error.message : error)
        }
        results[i] = null
      }

      completed++
      onProgress?.(completed, items.length)
      inProgress.delete(promise)
    })()

    inProgress.add(promise)

    // Wait for a slot if we've hit the concurrency limit
    if (inProgress.size >= concurrency) {
      await Promise.race(inProgress)
    }
  }

  // Wait for all remaining promises
  await Promise.all(inProgress)

  if (enableLogging) {
    const successful = results.filter((r) => r !== null).length
    console.log(`[BatchProcessor] Completed: ${successful}/${items.length} successful`)
  }

  return results
}

/**
 * Process items in fixed-size segments sequentially.
 * Balanced approach: safer than parallel, faster than sequential.
 */
async function processSegmented<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  segmentSize: number,
  onProgress?: (processed: number, total: number) => void,
  enableLogging?: boolean,
): Promise<(R | null)[]> {
  const results: (R | null)[] = []
  const segments: T[][] = []

  // Divide items into segments
  for (let i = 0; i < items.length; i += segmentSize) {
    segments.push(items.slice(i, i + segmentSize))
  }

  if (enableLogging) {
    console.log(`[BatchProcessor] Processing ${segments.length} segments of ${segmentSize} items`)
  }

  let processed = 0

  // Process each segment
  for (const segment of segments) {
    const segmentResults = await Promise.all(
      segment.map(async (item, idx) => {
        try {
          return await processor(item, results.length + idx)
        } catch (error) {
          if (enableLogging) {
            console.error(
              `[BatchProcessor] Item ${results.length + idx} failed:`,
              error instanceof Error ? error.message : error,
            )
          }
          return null
        }
      }),
    )

    results.push(...segmentResults)
    processed += segment.length
    onProgress?.(processed, items.length)
  }

  if (enableLogging) {
    const successful = results.filter((r) => r !== null).length
    console.log(`[BatchProcessor] Completed: ${successful}/${items.length} successful`)
  }

  return results
}
