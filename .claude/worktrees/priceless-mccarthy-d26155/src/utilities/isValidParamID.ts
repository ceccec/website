/**
 * Check whether the value is a safe slug-style segment for URL params (alphanumeric).
 */
export function isValidParamId(id: null | string): boolean {
  return Boolean(id && /^[a-z\d]+$/.test(id))
}
