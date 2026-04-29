/** Narrow REST/JSON error bodies at the client boundary (payload-basics: type at the edge). */
export function errorMessageFromJson(data: unknown): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as { message: unknown }).message === 'string'
  ) {
    return (data as { message: string }).message
  }
  return 'Unknown error'
}
