/**
 * Best-effort decode of Payload **`id`** from a JWT **without verifying** the signature.
 * Safe for **cache tag hints** and correlation only — authorization remains on the GraphQL/REST response.
 */
export function payloadCloudJwtUserId(token: string | null | undefined): string | undefined {
  if (token == null || String(token).trim() === '') {
    return undefined
  }
  const parts = String(token).split('.')
  if (parts.length < 2) {
    return undefined
  }
  try {
    const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = segment.length % 4 === 0 ? '' : '='.repeat(4 - (segment.length % 4))
    const payloadJson =
      typeof atob === 'function'
        ? atob(segment + pad)
        : typeof Buffer !== 'undefined'
          ? Buffer.from(segment + pad, 'base64').toString('utf8')
          : ''
    if (!payloadJson) {
      return undefined
    }
    const json = JSON.parse(payloadJson) as { id?: unknown }
    const id = json?.id
    return id != null && String(id) !== '' ? String(id) : undefined
  } catch {
    return undefined
  }
}
