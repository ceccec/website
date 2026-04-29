import type { CloudflareContext } from '@opennextjs/cloudflare'

import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'

import type { DeploymentTarget } from './deploymentTarget'

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
  if (direct?.startsWith('mongodb')) {return direct}
  const db = process.env.DATABASE_URL?.trim()
  if (db?.startsWith('mongodb')) {return db}
  return ''
}

function postgresConnectionString(): string {
  const explicit =
    process.env.POSTGRES_URL?.trim() ||
    (process.env.DATABASE_URL?.startsWith('postgres') ? process.env.DATABASE_URL.trim() : '')
  return explicit || ''
}

/**
 * Resolves the DB adapter for Payload (`templates/*` cover Postgres, D1, MongoDB separately).
 * MongoDB is supported only on Node / Vercel-like targets — never inside Cloudflare Workers.
 *
 * @see https://payloadcms.com/docs/database/overview
 */
export function resolvePayloadDb(opts: {
  cloudflare: CloudflareContext | undefined
  deploymentTarget: DeploymentTarget
}) {
  const { cloudflare, deploymentTarget } = opts

  const mongoUrl = mongoConnectionString()
  if (mongoUrl) {
    if (deploymentTarget === 'cloudflare') {
      throw new Error(
        'MongoDB cannot be used on the Cloudflare Workers + D1 path. Remove MONGODB_URL / mongodb DATABASE_URL or set PAYLOAD_HOSTING=vercel and run on Node.',
      )
    }
    return mongooseAdapter({ url: mongoUrl })
  }

  if (deploymentTarget === 'vercel') {
    const connectionString = postgresConnectionString()
    if (!connectionString) {
      throw new Error(
        'Postgres requires POSTGRES_URL or DATABASE_URL (postgres://…). For MongoDB, set MONGODB_URL. On Cloudflare, use D1 and omit mongo/postgres URLs.',
      )
    }
    return postgresAdapter({
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

  return sqliteD1Adapter({ binding: cloudflare.env.D1 })
}
