import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

/**
 * Registered migrations must expose a stable **`migrationName`** (stored in `payload-migrations`).
 * Greenfield layout: one orchestrator file (`*_d1_initial_schema.ts`) + ordered **`stages/*.ts`** (not registered).
 *
 * File naming: **`YYYYMMDD_HHmmss_<slug>.ts`** with **`snake_case`** slug (adapter-agnostic).
 */
export type MigrationModule = {
  readonly migrationName: string
  up: (args: MigrateUpArgs) => Promise<void>
  down: (args: MigrateDownArgs) => Promise<void>
}

export function toPayloadMigration(m: MigrationModule) {
  return { name: m.migrationName, up: m.up, down: m.down }
}
