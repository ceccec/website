import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

import type { MigrationModule } from './lib/migrationContract'
import * as stage01 from './stages/stage_01_core_schema'
import * as stage02 from './stages/stage_02_plugins_and_optional_collections'
import * as stage03 from './stages/stage_03_users_subscription_plan'
import * as stage04 from './stages/stage_04_payload_migrations_text_pk'
import * as stage05 from './stages/stage_05_shares'
import * as stage06 from './stages/stage_06_shares_integer_to_uuid_repair'

/** Single registry entry for new D1 databases — runs staged DDL in order (see `stages/`). */
export const migrationName = '20260430120000_d1_initial_schema' as const satisfies MigrationModule['migrationName']

export async function up(args: MigrateUpArgs): Promise<void> {
  await stage01.up(args)
  await stage02.up(args)
  await stage03.up(args)
  await stage04.up(args)
  await stage05.up(args)
  await stage06.up(args)
}

export async function down(args: MigrateDownArgs): Promise<void> {
  await stage06.down(args)
  await stage05.down(args)
  await stage04.down(args)
  await stage03.down(args)
  await stage02.down(args)
  await stage01.down(args)
}
