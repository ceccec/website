import type * as MongoDBPkg from '@payloadcms/db-mongodb'
import type * as PostgresPkg from '@payloadcms/db-postgres'

import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'

import type { DeploymentRuntimeOptions } from './deploymentTarget'

import { nodeRequire } from './nodeRequire'
import { PAYLOAD_SQL_ID_TYPE } from './payloadIdType'

function mongoConnectionString(): string {
  const adapterEnv = process.env.PAYLOAD_DB_ADAPTER?.toLowerCase()
  if (adapterEnv === 'mongodb') {
    const url = (process.env.MONGODB_URL || process.env.DATABASE_URL || '').trim()
    if (!url.startsWith('mongodb')) {
      throw new Error(
        'PAYLOAD_DB_ADAPTER=mongodb requires MONGODB_URL or a mongodb:// / mongodb+srv:// DATABASE_URL',
      )
    }
    return url
  }
  const direct = process.env.MONGODB_URL?.trim()
  if (direct?.startsWith('mongodb')) {
    return direct
  }
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (databaseUrl?.startsWith('mongodb')) {
    return databaseUrl
  }
  return ''
}

function postgresConnectionString(): string {
  const explicit =
    process.env.POSTGRES_URL?.trim() ||
    (process.env.DATABASE_URL?.startsWith('postgres') ? process.env.DATABASE_URL.trim() : '')
  return explicit || ''
}

/**
 * Resolves the database adapter for Payload (`templates/*` cover Postgres, D1, MongoDB separately).
 *
 * @see https://payloadcms.com/docs/database/overview
 */
export function resolvePayloadDB(opts: DeploymentRuntimeOptions) {
  const { cloudflare, deploymentTarget } = opts

  const mongoUrl = mongoConnectionString()
  if (mongoUrl) {
    if (deploymentTarget === 'cloudflare') {
      throw new Error(
        'MongoDB cannot be used on the Cloudflare Workers + D1 path. Remove MONGODB_URL / mongodb DATABASE_URL or set PAYLOAD_HOSTING=vercel and run on Node.',
      )
    }
    const { mongooseAdapter } = nodeRequire('@payloadcms/db-mongodb') as typeof MongoDBPkg
    return mongooseAdapter({ url: mongoUrl })
  }

  if (deploymentTarget === 'vercel') {
    const connectionString = postgresConnectionString()
    if (!connectionString) {
      throw new Error(
        'Postgres requires POSTGRES_URL or DATABASE_URL (postgres://…). For MongoDB, set MONGODB_URL. On Cloudflare, use D1 and omit mongo/postgres URLs.',
      )
    }
    const { postgresAdapter } = nodeRequire('@payloadcms/db-postgres') as typeof PostgresPkg
    return postgresAdapter({
      idType: PAYLOAD_SQL_ID_TYPE,
      pool: {
        connectionString,
      },
    })
  }

  if (!cloudflare?.env?.D1) {
    throw new Error(
      'D1 binding is missing. For Wrangler dev use remote bindings or ensure `wrangler.jsonc` defines D1.',
    )
  }

  return sqliteD1Adapter({
    binding: cloudflare.env.D1,
    idType: PAYLOAD_SQL_ID_TYPE,
  })
}
