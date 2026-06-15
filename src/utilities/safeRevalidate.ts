import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * `revalidatePath` / `revalidateTag` throw `Invariant: static generation store missing` when
 * invoked outside a Next.js request/render context — e.g. from a seed script, a migration, or any
 * Local API mutation run via `payload run`. There is no page cache to revalidate in those contexts,
 * so swallow that specific invariant and no-op. Any other error still propagates.
 */
function isOutsideRequestContext(err: unknown): boolean {
  if (!(err instanceof Error)) {
    return false
  }
  return /static generation store missing|outside a request|Invariant/i.test(err.message)
}

export function safeRevalidatePath(path: string, type?: 'layout' | 'page'): void {
  try {
    revalidatePath(path, type)
  } catch (err) {
    if (!isOutsideRequestContext(err)) {
      throw err
    }
  }
}

export function safeRevalidateTag(tag: string, profile: string): void {
  try {
    revalidateTag(tag, profile)
  } catch (err) {
    if (!isOutsideRequestContext(err)) {
      throw err
    }
  }
}
