import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

import { sql } from '@payloadcms/db-d1-sqlite'

/** Adds `users.subscription_plan` for tiered entitlements (starter / pro / enterprise). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(
    sql`ALTER TABLE \`users\` ADD \`subscription_plan\` text DEFAULT 'none';`,
  )
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // SQLite: dropping a column requires a table rebuild; leave schema unchanged on down.
}
