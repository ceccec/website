import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

import { sql } from '@payloadcms/db-d1-sqlite'

/**
 * Legacy **`payload_migrations`** rows used **`integer`** PKs; with **`idType: 'uuidv7'`** (`payloadDB.ts`)
 * Payload inserts UUID strings — D1 returns **`SQLITE_MISMATCH`**. Rebuild the table with **`id` text**.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
CREATE TABLE \`payload_migrations_new\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`name\` text,
  \`batch\` numeric,
  \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
`)
  await db.run(sql`
INSERT INTO \`payload_migrations_new\` (\`id\`, \`name\`, \`batch\`, \`updated_at\`, \`created_at\`)
SELECT CAST(\`id\` AS TEXT), \`name\`, \`batch\`, \`updated_at\`, \`created_at\`
FROM \`payload_migrations\`;
`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`ALTER TABLE \`payload_migrations_new\` RENAME TO \`payload_migrations\`;`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`,
  )
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // SQLite UUID PK → integer not reversible without losing ids.
}
