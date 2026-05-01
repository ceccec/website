/**
 * Default HTTP routes from Payload (`@payloadcms/next`).
 * @see https://payloadcms.com/docs/getting-started/concepts#rest-api
 * @see https://payloadcms.com/docs/getting-started/concepts#graphql-api
 */
export const PAYLOAD_REST_API_PREFIX = '/api'

export const PAYLOAD_GRAPHQL_PATH = `${PAYLOAD_REST_API_PREFIX}/graphql` as const
