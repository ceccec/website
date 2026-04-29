/**
 * Primary-key strategy for SQL adapters (Postgres + D1). Shared here so Vercel Postgres and
 * Cloudflare D1 stay aligned without duplicating literals.
 *
 * Typed as `const` so both `postgresAdapter` (`serial` | `uuid` | `uuidv7`) and
 * `sqliteD1Adapter` (`number` | `uuid` | `uuidv7`) accept it without widening to `serial`.
 *
 * MongoDB uses ObjectId strings via `@payloadcms/db-mongodb` — not configurable here.
 *
 * @see https://payloadcms.com/docs/database/overview
 */
export const PAYLOAD_SQL_ID_TYPE = 'uuidv7' as const
