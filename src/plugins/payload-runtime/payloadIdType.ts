/**
 * Primary-key strategy for SQL adapters (Postgres + D1). Shared here so Vercel Postgres and
 * Cloudflare D1 stay aligned without duplicating literals.
 *
 * SQLite/D1 store UUIds as **`text`** columns. Hand-written **`src/migrations/*.ts`** must match
 * (including **`payload_migrations`** and collection tables), not legacy **`integer`** PKs.
 *
 * @see https://payloadcms.com/docs/database/overview
 */
export const PAYLOAD_SQL_ID_TYPE = 'uuidv7'
