import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

import { sql } from '@payloadcms/db-d1-sqlite'

/**
 * Early **`shares`** DDL used **`integer`** PKs; D1 is configured with **`idType: 'uuidv7'`** — document ids
 * must be **`text`**. If `sqlite_master` still shows an integer **`shares.id`**, drop and recreate with the
 * same shape as {@link ./stage_05_shares.ts} (no row copy: assumes empty dev DBs from failed migrate).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const res = (await db.run(
    sql`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'shares'`,
  )) as { rows?: { sql?: string }[]; results?: { sql?: string }[] }
  const row = res.rows?.[0] ?? res.results?.[0]
  const createSql = row?.sql
  if (typeof createSql !== 'string') return
  if (!/`id`\s+integer/i.test(createSql)) return

  await db.run(sql`DROP TABLE IF EXISTS \`shares_rels\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`shares\`;`)

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`shares\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`token\` text NOT NULL,
  	\`expires_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`shares_token_idx\` ON \`shares\` (\`token\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`shares_updated_at_idx\` ON \`shares\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`shares_created_at_idx\` ON \`shares\` (\`created_at\`);`)

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`shares_rels\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` text NOT NULL,
  	\`path\` text NOT NULL,
  	\`case_studies_id\` text,
  	\`pages_id\` text,
  	\`posts_id\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`shares\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`shares_rels_order_idx\` ON \`shares_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`shares_rels_parent_idx\` ON \`shares_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`shares_rels_path_idx\` ON \`shares_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`shares_rels_case_studies_id_idx\` ON \`shares_rels\` (\`case_studies_id\`);`,
  )
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`shares_rels_pages_id_idx\` ON \`shares_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`shares_rels_posts_id_idx\` ON \`shares_rels\` (\`posts_id\`);`)

  try {
    await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`shares_id\`;`)
  } catch {
    // Column absent or SQLite too old for DROP COLUMN.
  }
  try {
    await db.run(
      sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`shares_id\` text REFERENCES shares(id);`,
    )
  } catch {
    // Column already correct or locked-docs row incompatible — admin may fix manually.
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
