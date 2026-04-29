/**
 * Optional plugins schema (env-gated in `src/plugins/env.ts` + `getPlugins()`):
 * multi-tenant (`tenants`, `users_tenants`, …), ecommerce + variants (`products`, `carts`, `orders`, …),
 * MCP (`payload_mcp_api_keys`), and ALTERs on `pages` / `_pages_v` / rel tables.
 *
 * Generated with all flags on:
 * `PAYLOAD_MULTI_TENANT=true PAYLOAD_ECOMMERCE=true PAYLOAD_ECOMMERCE_VARIANTS=true PAYLOAD_MCP=true pnpm exec payload migrate:create`
 *
 * `CREATE TABLE` / `CREATE INDEX` use `IF NOT EXISTS` so partially aligned DBs do not fail on replay.
 */
import type { MigrateDownArgs, MigrateUpArgs} from '@payloadcms/db-d1-sqlite';

import { sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`tenants\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`domain\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`tenants_slug_idx\` ON \`tenants\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`tenants_updated_at_idx\` ON \`tenants\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`tenants_created_at_idx\` ON \`tenants\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`users_tenants\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tenant_id\` integer NOT NULL,
  	FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_tenants_order_idx\` ON \`users_tenants\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_tenants_parent_id_idx\` ON \`users_tenants\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_tenants_tenant_idx\` ON \`users_tenants\` (\`tenant_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`addresses\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`customer_id\` integer,
  	\`title\` text,
  	\`first_name\` text,
  	\`last_name\` text,
  	\`company\` text,
  	\`address_line1\` text,
  	\`address_line2\` text,
  	\`city\` text,
  	\`state\` text,
  	\`postal_code\` text,
  	\`country\` text NOT NULL,
  	\`phone\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`customer_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`addresses_customer_idx\` ON \`addresses\` (\`customer_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`addresses_updated_at_idx\` ON \`addresses\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`addresses_created_at_idx\` ON \`addresses\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`variants\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`product_id\` integer,
  	\`inventory\` numeric DEFAULT 0,
  	\`price_in_u_s_d_enabled\` integer,
  	\`price_in_u_s_d\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` text,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variants_product_idx\` ON \`variants\` (\`product_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variants_updated_at_idx\` ON \`variants\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variants_created_at_idx\` ON \`variants\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variants_deleted_at_idx\` ON \`variants\` (\`deleted_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variants__status_idx\` ON \`variants\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`variants_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`variant_options_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`variants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`variant_options_id\`) REFERENCES \`variant_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variants_rels_order_idx\` ON \`variants_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variants_rels_parent_idx\` ON \`variants_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variants_rels_path_idx\` ON \`variants_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variants_rels_variant_options_id_idx\` ON \`variants_rels\` (\`variant_options_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_variants_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_product_id\` integer,
  	\`version_inventory\` numeric DEFAULT 0,
  	\`version_price_in_u_s_d_enabled\` integer,
  	\`version_price_in_u_s_d\` numeric,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version_deleted_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`variants\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_parent_idx\` ON \`_variants_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_version_version_product_idx\` ON \`_variants_v\` (\`version_product_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_version_version_updated_at_idx\` ON \`_variants_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_version_version_created_at_idx\` ON \`_variants_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_version_version_deleted_at_idx\` ON \`_variants_v\` (\`version_deleted_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_version_version__status_idx\` ON \`_variants_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_created_at_idx\` ON \`_variants_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_updated_at_idx\` ON \`_variants_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_snapshot_idx\` ON \`_variants_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_published_locale_idx\` ON \`_variants_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_latest_idx\` ON \`_variants_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_autosave_idx\` ON \`_variants_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_variants_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`variant_options_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_variants_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`variant_options_id\`) REFERENCES \`variant_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_rels_order_idx\` ON \`_variants_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_rels_parent_idx\` ON \`_variants_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_rels_path_idx\` ON \`_variants_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_variants_v_rels_variant_options_id_idx\` ON \`_variants_v_rels\` (\`variant_options_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`variant_types\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variant_types_updated_at_idx\` ON \`variant_types\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variant_types_created_at_idx\` ON \`variant_types\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variant_types_deleted_at_idx\` ON \`variant_types\` (\`deleted_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`variant_options\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_variantoptions_options_order\` text,
  	\`variant_type_id\` integer NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` text,
  	FOREIGN KEY (\`variant_type_id\`) REFERENCES \`variant_types\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variant_options__variantoptions_options_order_idx\` ON \`variant_options\` (\`_variantoptions_options_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variant_options_variant_type_idx\` ON \`variant_options\` (\`variant_type_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variant_options_updated_at_idx\` ON \`variant_options\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variant_options_created_at_idx\` ON \`variant_options\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`variant_options_deleted_at_idx\` ON \`variant_options\` (\`deleted_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`inventory\` numeric DEFAULT 0,
  	\`enable_variants\` integer,
  	\`price_in_u_s_d_enabled\` integer,
  	\`price_in_u_s_d\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` text,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`products_deleted_at_idx\` ON \`products\` (\`deleted_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`products__status_idx\` ON \`products\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`products_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`variant_types_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`variant_types_id\`) REFERENCES \`variant_types\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`products_rels_order_idx\` ON \`products_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`products_rels_parent_idx\` ON \`products_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`products_rels_path_idx\` ON \`products_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`products_rels_variant_types_id_idx\` ON \`products_rels\` (\`variant_types_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_products_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_inventory\` numeric DEFAULT 0,
  	\`version_enable_variants\` integer,
  	\`version_price_in_u_s_d_enabled\` integer,
  	\`version_price_in_u_s_d\` numeric,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version_deleted_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_parent_idx\` ON \`_products_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_version_version_updated_at_idx\` ON \`_products_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_version_version_created_at_idx\` ON \`_products_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_version_version_deleted_at_idx\` ON \`_products_v\` (\`version_deleted_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_version_version__status_idx\` ON \`_products_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_created_at_idx\` ON \`_products_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_updated_at_idx\` ON \`_products_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_snapshot_idx\` ON \`_products_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_published_locale_idx\` ON \`_products_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_latest_idx\` ON \`_products_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_autosave_idx\` ON \`_products_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_products_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`variant_types_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`variant_types_id\`) REFERENCES \`variant_types\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_rels_order_idx\` ON \`_products_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_rels_parent_idx\` ON \`_products_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_rels_path_idx\` ON \`_products_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_products_v_rels_variant_types_id_idx\` ON \`_products_v_rels\` (\`variant_types_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`carts_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`product_id\` integer,
  	\`variant_id\` integer,
  	\`quantity\` numeric DEFAULT 1 NOT NULL,
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`variant_id\`) REFERENCES \`variants\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`carts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`carts_items_order_idx\` ON \`carts_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`carts_items_parent_id_idx\` ON \`carts_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`carts_items_product_idx\` ON \`carts_items\` (\`product_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`carts_items_variant_idx\` ON \`carts_items\` (\`variant_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`carts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`secret\` text,
  	\`customer_id\` integer,
  	\`purchased_at\` text,
  	\`subtotal\` numeric,
  	\`currency\` text DEFAULT 'USD',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`customer_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`carts_secret_idx\` ON \`carts\` (\`secret\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`carts_customer_idx\` ON \`carts\` (\`customer_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`carts_updated_at_idx\` ON \`carts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`carts_created_at_idx\` ON \`carts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`orders_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`product_id\` integer,
  	\`variant_id\` integer,
  	\`quantity\` numeric DEFAULT 1 NOT NULL,
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`variant_id\`) REFERENCES \`variants\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`orders\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`orders_items_order_idx\` ON \`orders_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`orders_items_parent_id_idx\` ON \`orders_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`orders_items_product_idx\` ON \`orders_items\` (\`product_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`orders_items_variant_idx\` ON \`orders_items\` (\`variant_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`orders\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`shipping_address_title\` text,
  	\`shipping_address_first_name\` text,
  	\`shipping_address_last_name\` text,
  	\`shipping_address_company\` text,
  	\`shipping_address_address_line1\` text,
  	\`shipping_address_address_line2\` text,
  	\`shipping_address_city\` text,
  	\`shipping_address_state\` text,
  	\`shipping_address_postal_code\` text,
  	\`shipping_address_country\` text,
  	\`shipping_address_phone\` text,
  	\`customer_id\` integer,
  	\`customer_email\` text,
  	\`status\` text DEFAULT 'processing',
  	\`amount\` numeric,
  	\`currency\` text DEFAULT 'USD',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`customer_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`orders_customer_idx\` ON \`orders\` (\`customer_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`orders_updated_at_idx\` ON \`orders\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`orders_created_at_idx\` ON \`orders\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`orders_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`transactions_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`orders\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`transactions_id\`) REFERENCES \`transactions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`orders_rels_order_idx\` ON \`orders_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`orders_rels_parent_idx\` ON \`orders_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`orders_rels_path_idx\` ON \`orders_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`orders_rels_transactions_id_idx\` ON \`orders_rels\` (\`transactions_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`transactions_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`product_id\` integer,
  	\`variant_id\` integer,
  	\`quantity\` numeric DEFAULT 1 NOT NULL,
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`variant_id\`) REFERENCES \`variants\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`transactions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`transactions_items_order_idx\` ON \`transactions_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`transactions_items_parent_id_idx\` ON \`transactions_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`transactions_items_product_idx\` ON \`transactions_items\` (\`product_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`transactions_items_variant_idx\` ON \`transactions_items\` (\`variant_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`transactions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`billing_address_title\` text,
  	\`billing_address_first_name\` text,
  	\`billing_address_last_name\` text,
  	\`billing_address_company\` text,
  	\`billing_address_address_line1\` text,
  	\`billing_address_address_line2\` text,
  	\`billing_address_city\` text,
  	\`billing_address_state\` text,
  	\`billing_address_postal_code\` text,
  	\`billing_address_country\` text,
  	\`billing_address_phone\` text,
  	\`status\` text DEFAULT 'pending' NOT NULL,
  	\`customer_id\` integer,
  	\`customer_email\` text,
  	\`order_id\` integer,
  	\`cart_id\` integer,
  	\`amount\` numeric,
  	\`currency\` text DEFAULT 'USD',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`customer_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`cart_id\`) REFERENCES \`carts\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`transactions_customer_idx\` ON \`transactions\` (\`customer_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`transactions_order_idx\` ON \`transactions\` (\`order_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`transactions_cart_idx\` ON \`transactions\` (\`cart_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`transactions_updated_at_idx\` ON \`transactions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`transactions_created_at_idx\` ON \`transactions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_mcp_api_keys\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`label\` text,
  	\`description\` text,
  	\`case_studies_find\` integer DEFAULT false,
  	\`pages_find\` integer DEFAULT false,
  	\`posts_find\` integer DEFAULT false,
  	\`footer_find\` integer DEFAULT false,
  	\`main_menu_find\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`enable_a_p_i_key\` integer,
  	\`api_key\` text,
  	\`api_key_index\` text,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_mcp_api_keys_user_idx\` ON \`payload_mcp_api_keys\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_mcp_api_keys_updated_at_idx\` ON \`payload_mcp_api_keys\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_mcp_api_keys_created_at_idx\` ON \`payload_mcp_api_keys\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`tenant_id\` integer REFERENCES tenants(id);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_tenant_idx\` ON \`pages\` (\`tenant_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_tenant_id\` integer REFERENCES tenants(id);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_version_tenant_idx\` ON \`_pages_v\` (\`version_tenant_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`tenants_id\` integer REFERENCES tenants(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`addresses_id\` integer REFERENCES addresses(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`variants_id\` integer REFERENCES variants(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`variant_types_id\` integer REFERENCES variant_types(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`variant_options_id\` integer REFERENCES variant_options(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`products_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`carts_id\` integer REFERENCES carts(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`orders_id\` integer REFERENCES orders(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`transactions_id\` integer REFERENCES transactions(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`payload_mcp_api_keys_id\` integer REFERENCES payload_mcp_api_keys(id);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_tenants_id_idx\` ON \`payload_locked_documents_rels\` (\`tenants_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_addresses_id_idx\` ON \`payload_locked_documents_rels\` (\`addresses_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_variants_id_idx\` ON \`payload_locked_documents_rels\` (\`variants_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_variant_types_id_idx\` ON \`payload_locked_documents_rels\` (\`variant_types_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_variant_options_id_idx\` ON \`payload_locked_documents_rels\` (\`variant_options_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_carts_id_idx\` ON \`payload_locked_documents_rels\` (\`carts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_orders_id_idx\` ON \`payload_locked_documents_rels\` (\`orders_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_transactions_id_idx\` ON \`payload_locked_documents_rels\` (\`transactions_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_payload_mcp_api_keys_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_mcp_api_keys_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_preferences_rels\` ADD \`payload_mcp_api_keys_id\` integer REFERENCES payload_mcp_api_keys(id);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_rels_payload_mcp_api_keys_id_idx\` ON \`payload_preferences_rels\` (\`payload_mcp_api_keys_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`tenants\`;`)
  await db.run(sql`DROP TABLE \`users_tenants\`;`)
  await db.run(sql`DROP TABLE \`addresses\`;`)
  await db.run(sql`DROP TABLE \`variants\`;`)
  await db.run(sql`DROP TABLE \`variants_rels\`;`)
  await db.run(sql`DROP TABLE \`_variants_v\`;`)
  await db.run(sql`DROP TABLE \`_variants_v_rels\`;`)
  await db.run(sql`DROP TABLE \`variant_types\`;`)
  await db.run(sql`DROP TABLE \`variant_options\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`DROP TABLE \`products_rels\`;`)
  await db.run(sql`DROP TABLE \`_products_v\`;`)
  await db.run(sql`DROP TABLE \`_products_v_rels\`;`)
  await db.run(sql`DROP TABLE \`carts_items\`;`)
  await db.run(sql`DROP TABLE \`carts\`;`)
  await db.run(sql`DROP TABLE \`orders_items\`;`)
  await db.run(sql`DROP TABLE \`orders\`;`)
  await db.run(sql`DROP TABLE \`orders_rels\`;`)
  await db.run(sql`DROP TABLE \`transactions_items\`;`)
  await db.run(sql`DROP TABLE \`transactions\`;`)
  await db.run(sql`DROP TABLE \`payload_mcp_api_keys\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`full_title\` text,
  	\`noindex\` integer,
  	\`hero_type\` text DEFAULT 'default',
  	\`hero_full_background\` integer,
  	\`hero_theme\` text,
  	\`hero_enable_breadcrumbs_bar\` integer,
  	\`hero_livestream_date\` text,
  	\`hero_livestream_hide_breadcrumbs\` integer,
  	\`hero_livestream_rich_text\` text,
  	\`hero_enable_announcement\` integer,
  	\`hero_announcement_link_type\` text DEFAULT 'reference',
  	\`hero_announcement_link_new_tab\` integer,
  	\`hero_announcement_link_url\` text,
  	\`hero_announcement_link_label\` text,
  	\`hero_announcement_link_custom_id\` text,
  	\`hero_rich_text\` text,
  	\`hero_description\` text,
  	\`hero_secondary_heading\` text,
  	\`hero_secondary_description\` text,
  	\`hero_three_c_t_a\` text,
  	\`hero_newsletter_placeholder\` text,
  	\`hero_newsletter_description\` text,
  	\`hero_enable_media\` integer DEFAULT false,
  	\`hero_media_id\` integer,
  	\`hero_secondary_media_id\` integer,
  	\`hero_feature_video_id\` integer,
  	\`hero_form_id\` integer,
  	\`hero_logo_showcase_label\` text,
  	\`slug\` text,
  	\`parent_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`hero_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_secondary_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_feature_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages\`("id", "title", "full_title", "noindex", "hero_type", "hero_full_background", "hero_theme", "hero_enable_breadcrumbs_bar", "hero_livestream_date", "hero_livestream_hide_breadcrumbs", "hero_livestream_rich_text", "hero_enable_announcement", "hero_announcement_link_type", "hero_announcement_link_new_tab", "hero_announcement_link_url", "hero_announcement_link_label", "hero_announcement_link_custom_id", "hero_rich_text", "hero_description", "hero_secondary_heading", "hero_secondary_description", "hero_three_c_t_a", "hero_newsletter_placeholder", "hero_newsletter_description", "hero_enable_media", "hero_media_id", "hero_secondary_media_id", "hero_feature_video_id", "hero_form_id", "hero_logo_showcase_label", "slug", "parent_id", "updated_at", "created_at", "_status") SELECT "id", "title", "full_title", "noindex", "hero_type", "hero_full_background", "hero_theme", "hero_enable_breadcrumbs_bar", "hero_livestream_date", "hero_livestream_hide_breadcrumbs", "hero_livestream_rich_text", "hero_enable_announcement", "hero_announcement_link_type", "hero_announcement_link_new_tab", "hero_announcement_link_url", "hero_announcement_link_label", "hero_announcement_link_custom_id", "hero_rich_text", "hero_description", "hero_secondary_heading", "hero_secondary_description", "hero_three_c_t_a", "hero_newsletter_placeholder", "hero_newsletter_description", "hero_enable_media", "hero_media_id", "hero_secondary_media_id", "hero_feature_video_id", "hero_form_id", "hero_logo_showcase_label", "slug", "parent_id", "updated_at", "created_at", "_status" FROM \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages\` RENAME TO \`pages\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_hero_hero_media_idx\` ON \`pages\` (\`hero_media_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_hero_hero_secondary_media_idx\` ON \`pages\` (\`hero_secondary_media_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_hero_hero_feature_video_idx\` ON \`pages\` (\`hero_feature_video_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_hero_hero_form_idx\` ON \`pages\` (\`hero_form_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_parent_idx\` ON \`pages\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_full_title\` text,
  	\`version_noindex\` integer,
  	\`version_hero_type\` text DEFAULT 'default',
  	\`version_hero_full_background\` integer,
  	\`version_hero_theme\` text,
  	\`version_hero_enable_breadcrumbs_bar\` integer,
  	\`version_hero_livestream_date\` text,
  	\`version_hero_livestream_hide_breadcrumbs\` integer,
  	\`version_hero_livestream_rich_text\` text,
  	\`version_hero_enable_announcement\` integer,
  	\`version_hero_announcement_link_type\` text DEFAULT 'reference',
  	\`version_hero_announcement_link_new_tab\` integer,
  	\`version_hero_announcement_link_url\` text,
  	\`version_hero_announcement_link_label\` text,
  	\`version_hero_announcement_link_custom_id\` text,
  	\`version_hero_rich_text\` text,
  	\`version_hero_description\` text,
  	\`version_hero_secondary_heading\` text,
  	\`version_hero_secondary_description\` text,
  	\`version_hero_three_c_t_a\` text,
  	\`version_hero_newsletter_placeholder\` text,
  	\`version_hero_newsletter_description\` text,
  	\`version_hero_enable_media\` integer DEFAULT false,
  	\`version_hero_media_id\` integer,
  	\`version_hero_secondary_media_id\` integer,
  	\`version_hero_feature_video_id\` integer,
  	\`version_hero_form_id\` integer,
  	\`version_hero_logo_showcase_label\` text,
  	\`version_slug\` text,
  	\`version_parent_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_secondary_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_feature_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v\`("id", "parent_id", "version_title", "version_full_title", "version_noindex", "version_hero_type", "version_hero_full_background", "version_hero_theme", "version_hero_enable_breadcrumbs_bar", "version_hero_livestream_date", "version_hero_livestream_hide_breadcrumbs", "version_hero_livestream_rich_text", "version_hero_enable_announcement", "version_hero_announcement_link_type", "version_hero_announcement_link_new_tab", "version_hero_announcement_link_url", "version_hero_announcement_link_label", "version_hero_announcement_link_custom_id", "version_hero_rich_text", "version_hero_description", "version_hero_secondary_heading", "version_hero_secondary_description", "version_hero_three_c_t_a", "version_hero_newsletter_placeholder", "version_hero_newsletter_description", "version_hero_enable_media", "version_hero_media_id", "version_hero_secondary_media_id", "version_hero_feature_video_id", "version_hero_form_id", "version_hero_logo_showcase_label", "version_slug", "version_parent_id", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "snapshot", "published_locale", "latest") SELECT "id", "parent_id", "version_title", "version_full_title", "version_noindex", "version_hero_type", "version_hero_full_background", "version_hero_theme", "version_hero_enable_breadcrumbs_bar", "version_hero_livestream_date", "version_hero_livestream_hide_breadcrumbs", "version_hero_livestream_rich_text", "version_hero_enable_announcement", "version_hero_announcement_link_type", "version_hero_announcement_link_new_tab", "version_hero_announcement_link_url", "version_hero_announcement_link_label", "version_hero_announcement_link_custom_id", "version_hero_rich_text", "version_hero_description", "version_hero_secondary_heading", "version_hero_secondary_description", "version_hero_three_c_t_a", "version_hero_newsletter_placeholder", "version_hero_newsletter_description", "version_hero_enable_media", "version_hero_media_id", "version_hero_secondary_media_id", "version_hero_feature_video_id", "version_hero_form_id", "version_hero_logo_showcase_label", "version_slug", "version_parent_id", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "snapshot", "published_locale", "latest" FROM \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v\` RENAME TO \`_pages_v\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_hero_version_hero_media_idx\` ON \`_pages_v\` (\`version_hero_media_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_hero_version_hero_secondary_media_idx\` ON \`_pages_v\` (\`version_hero_secondary_media_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_hero_version_hero_feature_video_idx\` ON \`_pages_v\` (\`version_hero_feature_video_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_hero_version_hero_form_idx\` ON \`_pages_v\` (\`version_hero_form_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_parent_idx\` ON \`_pages_v\` (\`version_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_snapshot_idx\` ON \`_pages_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_published_locale_idx\` ON \`_pages_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`reusable_content_id\` integer,
  	\`case_studies_id\` integer,
  	\`community_help_id\` integer,
  	\`posts_id\` integer,
  	\`categories_id\` integer,
  	\`docs_id\` integer,
  	\`partners_id\` integer,
  	\`industries_id\` integer,
  	\`specialties_id\` integer,
  	\`regions_id\` integer,
  	\`budgets_id\` integer,
  	\`pages_id\` integer,
  	\`forms_id\` integer,
  	\`form_submissions_id\` integer,
  	\`redirects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`reusable_content_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`community_help_id\`) REFERENCES \`community_help\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`docs_id\`) REFERENCES \`docs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`partners_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`industries_id\`) REFERENCES \`industries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`specialties_id\`) REFERENCES \`specialties\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`regions_id\`) REFERENCES \`regions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`budgets_id\`) REFERENCES \`budgets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`forms_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`form_submissions_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`redirects_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "reusable_content_id", "case_studies_id", "community_help_id", "posts_id", "categories_id", "docs_id", "partners_id", "industries_id", "specialties_id", "regions_id", "budgets_id", "pages_id", "forms_id", "form_submissions_id", "redirects_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "reusable_content_id", "case_studies_id", "community_help_id", "posts_id", "categories_id", "docs_id", "partners_id", "industries_id", "specialties_id", "regions_id", "budgets_id", "pages_id", "forms_id", "form_submissions_id", "redirects_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_reusable_content_id_idx\` ON \`payload_locked_documents_rels\` (\`reusable_content_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_case_studies_id_idx\` ON \`payload_locked_documents_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_community_help_id_idx\` ON \`payload_locked_documents_rels\` (\`community_help_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_docs_id_idx\` ON \`payload_locked_documents_rels\` (\`docs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_partners_id_idx\` ON \`payload_locked_documents_rels\` (\`partners_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_industries_id_idx\` ON \`payload_locked_documents_rels\` (\`industries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_specialties_id_idx\` ON \`payload_locked_documents_rels\` (\`specialties_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_regions_id_idx\` ON \`payload_locked_documents_rels\` (\`regions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_budgets_id_idx\` ON \`payload_locked_documents_rels\` (\`budgets_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_forms_id_idx\` ON \`payload_locked_documents_rels\` (\`forms_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_form_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`form_submissions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_preferences_rels\`("id", "order", "parent_id", "path", "users_id") SELECT "id", "order", "parent_id", "path", "users_id" FROM \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_preferences_rels\` RENAME TO \`payload_preferences_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
}
