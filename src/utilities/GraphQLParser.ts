/**
 * Unified GraphQL response parsing utility for Cloud API and other GraphQL endpoints.
 * Handles error detection, nested data extraction, and consistent error messages.
 */

export interface GraphQLErrorEnvelope {
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>
  data?: unknown
}

/**
 * Parse a GraphQL response and extract data at the specified path.
 * Throws if response is not ok, if GraphQL errors exist, or if data is missing.
 *
 * @param response - The fetch Response object
 * @param dataPath - Dot-separated path to the data (e.g., 'Projects', 'Teams.docs', 'User.profile.name')
 * @returns The extracted data
 *
 * @example
 * const projects = await parseGraphQLResponse(response, 'Projects')
 * const teams = await parseGraphQLResponse(response, 'Teams.docs')
 */
export async function parseGraphQLResponse<T = unknown>(
  response: Response,
  dataPath: string,
): Promise<T> {
  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
  }

  let json: unknown

  try {
    json = await response.json()
  } catch (parseError) {
    throw new Error(
      `Failed to parse GraphQL response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
    )
  }

  const envelope = json as GraphQLErrorEnvelope

  // Check for GraphQL errors
  if (envelope.errors && envelope.errors.length > 0) {
    const errorMessage = envelope.errors[0].message
    throw new Error(`GraphQL error: ${errorMessage}`)
  }

  // Extract data at the specified path
  const data = getNestedData(envelope.data, dataPath)

  if (data === undefined || data === null) {
    throw new Error(`No data found at path: ${dataPath}`)
  }

  return data as T
}

/**
 * Get nested data from an object using dot notation.
 *
 * @param obj - The source object
 * @param path - Dot-separated path (e.g., 'foo.bar.baz')
 * @returns The value at the path, or undefined if not found
 */
function getNestedData(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}
