/**
 * Short prefix for admin list/search ergonomics. Routes and APIs keep the full identifier.
 */
export function truncateUuidForDisplay(id: unknown, headChars = 8): string {
  if (typeof id !== 'string' && typeof id !== 'number' && typeof id !== 'bigint' && typeof id !== 'boolean') {
    return ''
  }
  const s = String(id).trim()
  if (s.length <= headChars + 1) {
    return s
  }
  return `${s.slice(0, headChars)}…`
}
