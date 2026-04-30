import type { MigrateDownArgs, MigrateUpArgs} from '@payloadcms/db-d1-sqlite';

import { sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`users_roles\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_roles_order_idx\` ON \`users_roles\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_roles_parent_idx\` ON \`users_roles\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`first_name\` text NOT NULL,
  	\`last_name\` text NOT NULL,
  	\`twitter\` text,
  	\`photo_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_photo_idx\` ON \`users\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`dark_mode_fallback_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	FOREIGN KEY (\`dark_mode_fallback_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`media_dark_mode_fallback_idx\` ON \`media\` (\`dark_mode_fallback_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`banner_fields_settings_theme\` text,
  	\`banner_fields_settings_background\` text,
  	\`banner_fields_type\` text DEFAULT 'default',
  	\`banner_fields_add_checkmark\` integer,
  	\`banner_fields_content\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_banner_order_idx\` ON \`reusable_content_blocks_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_banner_parent_id_idx\` ON \`reusable_content_blocks_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_banner_path_idx\` ON \`reusable_content_blocks_banner\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_blog_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`blog_content_fields_settings_theme\` text,
  	\`blog_content_fields_settings_background\` text,
  	\`blog_content_fields_rich_text\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_blog_content_order_idx\` ON \`reusable_content_blocks_blog_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_blog_content_parent_id_idx\` ON \`reusable_content_blocks_blog_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_blog_content_path_idx\` ON \`reusable_content_blocks_blog_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_blog_markdown\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`blog_markdown_fields_settings_theme\` text,
  	\`blog_markdown_fields_settings_background\` text,
  	\`blog_markdown_fields_markdown\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_blog_markdown_order_idx\` ON \`reusable_content_blocks_blog_markdown\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_blog_markdown_parent_id_idx\` ON \`reusable_content_blocks_blog_markdown\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_blog_markdown_path_idx\` ON \`reusable_content_blocks_blog_markdown\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`co_callout_fields_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`co\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`co_callout_fields_images_order_idx\` ON \`co_callout_fields_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`co_callout_fields_images_parent_id_idx\` ON \`co_callout_fields_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`co_callout_fields_images_image_idx\` ON \`co_callout_fields_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`co\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`callout_fields_settings_theme\` text,
  	\`callout_fields_settings_background\` text,
  	\`callout_fields_rich_text\` text NOT NULL,
  	\`callout_fields_logo_id\` integer NOT NULL,
  	\`callout_fields_author\` text,
  	\`callout_fields_role\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`callout_fields_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`co_order_idx\` ON \`co\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`co_parent_id_idx\` ON \`co\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`co_path_idx\` ON \`co\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`co_callout_fields_callout_fields_logo_idx\` ON \`co\` (\`callout_fields_logo_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_cta_cta_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'link',
  	\`npm_cta_label\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_cta_cta_fields_links_order_idx\` ON \`reusable_content_blocks_cta_cta_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_cta_cta_fields_links_parent_id_idx\` ON \`reusable_content_blocks_cta_cta_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`cta_fields_settings_theme\` text,
  	\`cta_fields_settings_background\` text,
  	\`cta_fields_style\` text DEFAULT 'buttons',
  	\`cta_fields_rich_text\` text NOT NULL,
  	\`cta_fields_command_line\` text,
  	\`cta_fields_banner_link_type\` text DEFAULT 'reference',
  	\`cta_fields_banner_link_new_tab\` integer,
  	\`cta_fields_banner_link_url\` text,
  	\`cta_fields_banner_link_label\` text,
  	\`cta_fields_banner_link_custom_id\` text,
  	\`cta_fields_banner_image_id\` integer,
  	\`cta_fields_gradient_background\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`cta_fields_banner_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_cta_order_idx\` ON \`reusable_content_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_cta_parent_id_idx\` ON \`reusable_content_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_cta_path_idx\` ON \`reusable_content_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_cta_cta_fields_cta_fields_banner_idx\` ON \`reusable_content_blocks_cta\` (\`cta_fields_banner_image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_card_grid_card_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_card_grid_card_grid_fields_links_order_idx\` ON \`reusable_content_blocks_card_grid_card_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_card_grid_card_grid_fields_links_parent_id_idx\` ON \`reusable_content_blocks_card_grid_card_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_card_grid_card_grid_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_card_grid_card_grid_fields_cards_order_idx\` ON \`reusable_content_blocks_card_grid_card_grid_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_card_grid_card_grid_fields_cards_parent_id_idx\` ON \`reusable_content_blocks_card_grid_card_grid_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`card_grid_fields_settings_theme\` text,
  	\`card_grid_fields_settings_background\` text,
  	\`card_grid_fields_rich_text\` text NOT NULL,
  	\`card_grid_fields_reveal_description\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_card_grid_order_idx\` ON \`reusable_content_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_card_grid_parent_id_idx\` ON \`reusable_content_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_card_grid_path_idx\` ON \`reusable_content_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`csc_case_study_card_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`rich_text\` text NOT NULL,
  	\`case_study_id\` integer NOT NULL,
  	FOREIGN KEY (\`case_study_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`csc\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csc_case_study_card_fields_cards_order_idx\` ON \`csc_case_study_card_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csc_case_study_card_fields_cards_parent_id_idx\` ON \`csc_case_study_card_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csc_case_study_card_fields_cards_case_study_idx\` ON \`csc_case_study_card_fields_cards\` (\`case_study_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`csc\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`case_study_card_fields_settings_theme\` text,
  	\`case_study_card_fields_settings_background\` text,
  	\`case_study_card_fields_pixels\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csc_order_idx\` ON \`csc\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csc_parent_id_idx\` ON \`csc\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csc_path_idx\` ON \`csc\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`csh\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`case_studies_highlight_fields_settings_theme\` text,
  	\`case_studies_highlight_fields_settings_background\` text,
  	\`case_studies_highlight_fields_rich_text\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csh_order_idx\` ON \`csh\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csh_parent_id_idx\` ON \`csh\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csh_path_idx\` ON \`csh\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`csp_case_study_parallax_fields_items_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`csp_case_study_parallax_fields_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csp_case_study_parallax_fields_items_images_order_idx\` ON \`csp_case_study_parallax_fields_items_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csp_case_study_parallax_fields_items_images_parent_id_idx\` ON \`csp_case_study_parallax_fields_items_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csp_case_study_parallax_fields_items_images_image_idx\` ON \`csp_case_study_parallax_fields_items_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`csp_case_study_parallax_fields_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`quote\` text NOT NULL,
  	\`author\` text,
  	\`logo_id\` integer NOT NULL,
  	\`tab_label\` text NOT NULL,
  	\`case_study_id\` integer NOT NULL,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`case_study_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`csp\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csp_case_study_parallax_fields_items_order_idx\` ON \`csp_case_study_parallax_fields_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csp_case_study_parallax_fields_items_parent_id_idx\` ON \`csp_case_study_parallax_fields_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csp_case_study_parallax_fields_items_logo_idx\` ON \`csp_case_study_parallax_fields_items\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csp_case_study_parallax_fields_items_case_study_idx\` ON \`csp_case_study_parallax_fields_items\` (\`case_study_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`csp\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`case_study_parallax_fields_settings_theme\` text,
  	\`case_study_parallax_fields_settings_background\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csp_order_idx\` ON \`csp\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csp_parent_id_idx\` ON \`csp\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`csp_path_idx\` ON \`csp\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_code_code_fields_code_blips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`row\` numeric NOT NULL,
  	\`label\` text NOT NULL,
  	\`feature\` text NOT NULL,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content_blocks_code\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_code_code_fields_code_blips_order_idx\` ON \`reusable_content_blocks_code_code_fields_code_blips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_code_code_fields_code_blips_parent_id_idx\` ON \`reusable_content_blocks_code_code_fields_code_blips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_code\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`code_fields_settings_theme\` text,
  	\`code_fields_settings_background\` text,
  	\`code_fields_language\` text DEFAULT 'none',
  	\`code_fields_code\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_code_order_idx\` ON \`reusable_content_blocks_code\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_code_parent_id_idx\` ON \`reusable_content_blocks_code\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_code_path_idx\` ON \`reusable_content_blocks_code\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`cdf_code_feature_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cdf\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cdf_code_feature_fields_links_order_idx\` ON \`cdf_code_feature_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cdf_code_feature_fields_links_parent_id_idx\` ON \`cdf_code_feature_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`cdf_code_feature_fields_code_tabs_code_blips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`row\` numeric NOT NULL,
  	\`label\` text NOT NULL,
  	\`feature\` text NOT NULL,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cdf_code_feature_fields_code_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cdf_code_feature_fields_code_tabs_code_blips_order_idx\` ON \`cdf_code_feature_fields_code_tabs_code_blips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cdf_code_feature_fields_code_tabs_code_blips_parent_id_idx\` ON \`cdf_code_feature_fields_code_tabs_code_blips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`cdf_code_feature_fields_code_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`language\` text DEFAULT 'none',
  	\`label\` text NOT NULL,
  	\`code\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cdf\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cdf_code_feature_fields_code_tabs_order_idx\` ON \`cdf_code_feature_fields_code_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cdf_code_feature_fields_code_tabs_parent_id_idx\` ON \`cdf_code_feature_fields_code_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`cdf\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`code_feature_fields_settings_theme\` text,
  	\`code_feature_fields_settings_background\` text,
  	\`code_feature_fields_force_dark_background\` integer,
  	\`code_feature_fields_alignment\` text DEFAULT 'contentCode',
  	\`code_feature_fields_heading\` text,
  	\`code_feature_fields_rich_text\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cdf_order_idx\` ON \`cdf\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cdf_parent_id_idx\` ON \`cdf\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cdf_path_idx\` ON \`cdf\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`cmp_comparison_table_fields_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`feature\` text NOT NULL,
  	\`column_one_check\` integer,
  	\`column_one\` text,
  	\`column_two_check\` integer,
  	\`column_two\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cmp\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cmp_comparison_table_fields_rows_order_idx\` ON \`cmp_comparison_table_fields_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cmp_comparison_table_fields_rows_parent_id_idx\` ON \`cmp_comparison_table_fields_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`cmp\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`comparison_table_fields_settings_theme\` text,
  	\`comparison_table_fields_settings_background\` text,
  	\`comparison_table_fields_intro_content\` text,
  	\`comparison_table_fields_style\` text DEFAULT 'default',
  	\`comparison_table_fields_header_table_title\` text NOT NULL,
  	\`comparison_table_fields_header_column_one_header\` text NOT NULL,
  	\`comparison_table_fields_header_column_two_header\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cmp_order_idx\` ON \`cmp\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cmp_parent_id_idx\` ON \`cmp\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cmp_path_idx\` ON \`cmp\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content_fields_settings_theme\` text,
  	\`content_fields_settings_background\` text,
  	\`content_fields_use_leading_header\` integer,
  	\`content_fields_leading_header\` text,
  	\`content_fields_layout\` text DEFAULT 'oneColumn',
  	\`content_fields_column_one\` text NOT NULL,
  	\`content_fields_column_two\` text,
  	\`content_fields_column_three\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_content_order_idx\` ON \`reusable_content_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_content_parent_id_idx\` ON \`reusable_content_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_content_path_idx\` ON \`reusable_content_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`cgr_content_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cgr\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cgr_content_grid_fields_links_order_idx\` ON \`cgr_content_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cgr_content_grid_fields_links_parent_id_idx\` ON \`cgr_content_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`cgr_content_grid_fields_cells\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cgr\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cgr_content_grid_fields_cells_order_idx\` ON \`cgr_content_grid_fields_cells\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cgr_content_grid_fields_cells_parent_id_idx\` ON \`cgr_content_grid_fields_cells\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`cgr\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content_grid_fields_settings_theme\` text,
  	\`content_grid_fields_settings_background\` text,
  	\`content_grid_fields_style\` text DEFAULT 'gridBelow',
  	\`content_grid_fields_show_numbers\` integer,
  	\`content_grid_fields_content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cgr_order_idx\` ON \`cgr\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cgr_parent_id_idx\` ON \`cgr\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`cgr_path_idx\` ON \`cgr\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_code_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`code\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_code_example_block_order_idx\` ON \`reusable_content_blocks_code_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_code_example_block_parent_id_idx\` ON \`reusable_content_blocks_code_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_code_example_block_path_idx\` ON \`reusable_content_blocks_code_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_media_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_media_example_block_order_idx\` ON \`reusable_content_blocks_media_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_media_example_block_parent_id_idx\` ON \`reusable_content_blocks_media_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_media_example_block_path_idx\` ON \`reusable_content_blocks_media_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_media_example_block_media_idx\` ON \`reusable_content_blocks_media_example_block\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_example_tabs_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`content\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content_blocks_example_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_example_tabs_tabs_order_idx\` ON \`reusable_content_blocks_example_tabs_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_example_tabs_tabs_parent_id_idx\` ON \`reusable_content_blocks_example_tabs_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_example_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_example_tabs_order_idx\` ON \`reusable_content_blocks_example_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_example_tabs_parent_id_idx\` ON \`reusable_content_blocks_example_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_example_tabs_path_idx\` ON \`reusable_content_blocks_example_tabs\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`form_fields_settings_theme\` text,
  	\`form_fields_settings_background\` text,
  	\`form_fields_rich_text\` text NOT NULL,
  	\`form_fields_form_id\` integer NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`form_fields_form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_form_order_idx\` ON \`reusable_content_blocks_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_form_parent_id_idx\` ON \`reusable_content_blocks_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_form_path_idx\` ON \`reusable_content_blocks_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_form_form_fields_form_fields_for_idx\` ON \`reusable_content_blocks_form\` (\`form_fields_form_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_hover_cards_hover_cards_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content_blocks_hover_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_hover_cards_hover_cards_fields_cards_order_idx\` ON \`reusable_content_blocks_hover_cards_hover_cards_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_hover_cards_hover_cards_fields_cards_parent_id_idx\` ON \`reusable_content_blocks_hover_cards_hover_cards_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_hover_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hover_cards_fields_settings_theme\` text,
  	\`hover_cards_fields_settings_background\` text,
  	\`hover_cards_fields_hide_background\` integer,
  	\`hover_cards_fields_rich_text\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_hover_cards_order_idx\` ON \`reusable_content_blocks_hover_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_hover_cards_parent_id_idx\` ON \`reusable_content_blocks_hover_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_hover_cards_path_idx\` ON \`reusable_content_blocks_hover_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`hhl_highlight_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	\`media_top_id\` integer,
  	\`media_bottom_id\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`media_top_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`media_bottom_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`hhl\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`hhl_highlight_rows_order_idx\` ON \`hhl_highlight_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`hhl_highlight_rows_parent_id_idx\` ON \`hhl_highlight_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`hhl_highlight_rows_media_media_top_idx\` ON \`hhl_highlight_rows\` (\`media_top_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`hhl_highlight_rows_media_media_bottom_idx\` ON \`hhl_highlight_rows\` (\`media_bottom_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`hhl\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hover_highlights_fields_settings_theme\` text,
  	\`hover_highlights_fields_settings_background\` text,
  	\`hover_highlights_fields_before_highlights\` text,
  	\`hover_highlights_fields_after_highlights\` text,
  	\`hover_highlights_fields_link_type\` text DEFAULT 'reference',
  	\`hover_highlights_fields_link_new_tab\` integer,
  	\`hover_highlights_fields_link_url\` text,
  	\`hover_highlights_fields_link_label\` text NOT NULL,
  	\`hover_highlights_fields_link_custom_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`hhl_order_idx\` ON \`hhl\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`hhl_parent_id_idx\` ON \`hhl\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`hhl_path_idx\` ON \`hhl\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_link_grid_link_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content_blocks_link_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_link_grid_link_grid_fields_links_order_idx\` ON \`reusable_content_blocks_link_grid_link_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_link_grid_link_grid_fields_links_parent_id_idx\` ON \`reusable_content_blocks_link_grid_link_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_link_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_grid_fields_settings_theme\` text,
  	\`link_grid_fields_settings_background\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_link_grid_order_idx\` ON \`reusable_content_blocks_link_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_link_grid_parent_id_idx\` ON \`reusable_content_blocks_link_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_link_grid_path_idx\` ON \`reusable_content_blocks_link_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_logo_grid_logo_grid_fields_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`logo_media_id\` integer NOT NULL,
  	FOREIGN KEY (\`logo_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content_blocks_logo_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_logo_grid_logo_grid_fields_logos_order_idx\` ON \`reusable_content_blocks_logo_grid_logo_grid_fields_logos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_logo_grid_logo_grid_fields_logos_parent_id_idx\` ON \`reusable_content_blocks_logo_grid_logo_grid_fields_logos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_logo_grid_logo_grid_fields_logos_idx\` ON \`reusable_content_blocks_logo_grid_logo_grid_fields_logos\` (\`logo_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_logo_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`logo_grid_fields_settings_theme\` text,
  	\`logo_grid_fields_settings_background\` text,
  	\`logo_grid_fields_rich_text\` text NOT NULL,
  	\`logo_grid_fields_enable_link\` integer,
  	\`logo_grid_fields_link_type\` text DEFAULT 'reference',
  	\`logo_grid_fields_link_new_tab\` integer,
  	\`logo_grid_fields_link_url\` text,
  	\`logo_grid_fields_link_label\` text,
  	\`logo_grid_fields_link_custom_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_logo_grid_order_idx\` ON \`reusable_content_blocks_logo_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_logo_grid_parent_id_idx\` ON \`reusable_content_blocks_logo_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_logo_grid_path_idx\` ON \`reusable_content_blocks_logo_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`mb\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_block_fields_settings_theme\` text,
  	\`media_block_fields_settings_background\` text,
  	\`media_block_fields_position\` text DEFAULT 'default',
  	\`media_block_fields_media_id\` integer NOT NULL,
  	\`media_block_fields_caption\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_block_fields_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mb_order_idx\` ON \`mb\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mb_parent_id_idx\` ON \`mb\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mb_path_idx\` ON \`mb\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mb_media_block_fields_media_block_fields_media_idx\` ON \`mb\` (\`media_block_fields_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`mcnt_media_content_fields_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`mcnt\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mcnt_media_content_fields_images_order_idx\` ON \`mcnt_media_content_fields_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mcnt_media_content_fields_images_parent_id_idx\` ON \`mcnt_media_content_fields_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mcnt_media_content_fields_images_image_idx\` ON \`mcnt_media_content_fields_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`mcnt\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_content_fields_settings_theme\` text,
  	\`media_content_fields_settings_background\` text,
  	\`media_content_fields_alignment\` text DEFAULT 'contentMedia',
  	\`media_content_fields_media_width\` text DEFAULT 'stretch',
  	\`media_content_fields_rich_text\` text NOT NULL,
  	\`media_content_fields_enable_link\` integer,
  	\`media_content_fields_link_type\` text DEFAULT 'reference',
  	\`media_content_fields_link_new_tab\` integer,
  	\`media_content_fields_link_url\` text,
  	\`media_content_fields_link_label\` text,
  	\`media_content_fields_link_custom_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mcnt_order_idx\` ON \`mcnt\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mcnt_parent_id_idx\` ON \`mcnt\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mcnt_path_idx\` ON \`mcnt\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`mca_media_content_accordion_fields_accordion\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`position\` text DEFAULT 'normal',
  	\`background\` text DEFAULT 'none',
  	\`media_label\` text NOT NULL,
  	\`media_description\` text NOT NULL,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`media_id\` integer NOT NULL,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`mca\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mca_media_content_accordion_fields_accordion_order_idx\` ON \`mca_media_content_accordion_fields_accordion\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mca_media_content_accordion_fields_accordion_parent_id_idx\` ON \`mca_media_content_accordion_fields_accordion\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mca_media_content_accordion_fields_accordion_media_idx\` ON \`mca_media_content_accordion_fields_accordion\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`mca\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_content_accordion_fields_settings_theme\` text,
  	\`media_content_accordion_fields_settings_background\` text,
  	\`media_content_accordion_fields_alignment\` text DEFAULT 'contentMedia',
  	\`media_content_accordion_fields_leader\` text,
  	\`media_content_accordion_fields_heading\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mca_order_idx\` ON \`mca\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mca_parent_id_idx\` ON \`mca\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`mca_path_idx\` ON \`mca\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`feats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`feature\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tiers\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`feats_order_idx\` ON \`feats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`feats_parent_id_idx\` ON \`feats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`tiers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`has_price\` integer,
  	\`enable_create_payload\` integer,
  	\`price\` text,
  	\`title\` text,
  	\`description\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`prc\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`tiers_order_idx\` ON \`tiers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`tiers_parent_id_idx\` ON \`tiers\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`prc\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`pricing_fields_settings_theme\` text,
  	\`pricing_fields_settings_background\` text,
  	\`pricing_fields_disclaimer\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`prc_order_idx\` ON \`prc\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`prc_parent_id_idx\` ON \`prc\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`prc_path_idx\` ON \`prc\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_slider_slider_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_slider_slider_fields_links_order_idx\` ON \`reusable_content_blocks_slider_slider_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_slider_slider_fields_links_parent_id_idx\` ON \`reusable_content_blocks_slider_slider_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_slider_slider_fields_quote_slides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`quote\` text NOT NULL,
  	\`author\` text NOT NULL,
  	\`role\` text,
  	\`logo_id\` integer,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_slider_slider_fields_quote_slides_order_idx\` ON \`reusable_content_blocks_slider_slider_fields_quote_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_slider_slider_fields_quote_slides_parent_id_idx\` ON \`reusable_content_blocks_slider_slider_fields_quote_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_slider_slider_fields_quote_slide_idx\` ON \`reusable_content_blocks_slider_slider_fields_quote_slides\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slider_fields_settings_theme\` text,
  	\`slider_fields_settings_background\` text,
  	\`slider_fields_intro_content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_slider_order_idx\` ON \`reusable_content_blocks_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_slider_parent_id_idx\` ON \`reusable_content_blocks_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_slider_path_idx\` ON \`reusable_content_blocks_slider\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`stm_statement_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`stm\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`stm_statement_fields_links_order_idx\` ON \`stm_statement_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`stm_statement_fields_links_parent_id_idx\` ON \`stm_statement_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`stm\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`statement_fields_settings_theme\` text,
  	\`statement_fields_settings_background\` text,
  	\`statement_fields_rich_text\` text NOT NULL,
  	\`statement_fields_asset_type\` text DEFAULT 'media',
  	\`statement_fields_media_id\` integer,
  	\`statement_fields_code\` text,
  	\`statement_fields_media_width\` text DEFAULT 'medium',
  	\`statement_fields_background_glow\` text DEFAULT 'none',
  	\`statement_fields_asset_caption\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`statement_fields_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`stm_order_idx\` ON \`stm\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`stm_parent_id_idx\` ON \`stm\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`stm_path_idx\` ON \`stm\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`stm_statement_fields_statement_fields_media_idx\` ON \`stm\` (\`statement_fields_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_steps_steps_fields_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content_blocks_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_steps_steps_fields_steps_order_idx\` ON \`reusable_content_blocks_steps_steps_fields_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_steps_steps_fields_steps_parent_id_idx\` ON \`reusable_content_blocks_steps_steps_fields_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_steps_steps_fields_steps_media_idx\` ON \`reusable_content_blocks_steps_steps_fields_steps\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_blocks_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`steps_fields_settings_theme\` text,
  	\`steps_fields_settings_background\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_steps_order_idx\` ON \`reusable_content_blocks_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_steps_parent_id_idx\` ON \`reusable_content_blocks_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_blocks_steps_path_idx\` ON \`reusable_content_blocks_steps\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`rows_code_blips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`row\` numeric,
  	\`label\` text,
  	\`feature\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`rows_code_blips_order_idx\` ON \`rows_code_blips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`rows_code_blips_parent_id_idx\` ON \`rows_code_blips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`rich_text\` text NOT NULL,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`type\` text,
  	\`code\` text,
  	\`media_id\` integer,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`shl\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`rows_order_idx\` ON \`rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`rows_parent_id_idx\` ON \`rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`rows_media_idx\` ON \`rows\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`shl\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`sticky_highlights_fields_settings_theme\` text,
  	\`sticky_highlights_fields_settings_background\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`shl_order_idx\` ON \`shl\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`shl_parent_id_idx\` ON \`shl\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`shl_path_idx\` ON \`shl\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_updated_at_idx\` ON \`reusable_content\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_created_at_idx\` ON \`reusable_content\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`reusable_content_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_rels_order_idx\` ON \`reusable_content_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_rels_parent_idx\` ON \`reusable_content_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_rels_path_idx\` ON \`reusable_content_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_rels_pages_id_idx\` ON \`reusable_content_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_rels_posts_id_idx\` ON \`reusable_content_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`reusable_content_rels_case_studies_id_idx\` ON \`reusable_content_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_cta_cta_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'link',
  	\`npm_cta_label\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_cta_cta_fields_links_order_idx\` ON \`case_studies_blocks_cta_cta_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_cta_cta_fields_links_parent_id_idx\` ON \`case_studies_blocks_cta_cta_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`cta_fields_settings_theme\` text,
  	\`cta_fields_settings_background\` text,
  	\`cta_fields_style\` text DEFAULT 'buttons',
  	\`cta_fields_rich_text\` text,
  	\`cta_fields_command_line\` text,
  	\`cta_fields_banner_link_type\` text DEFAULT 'reference',
  	\`cta_fields_banner_link_new_tab\` integer,
  	\`cta_fields_banner_link_url\` text,
  	\`cta_fields_banner_link_label\` text,
  	\`cta_fields_banner_link_custom_id\` text,
  	\`cta_fields_banner_image_id\` integer,
  	\`cta_fields_gradient_background\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`cta_fields_banner_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_cta_order_idx\` ON \`case_studies_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_cta_parent_id_idx\` ON \`case_studies_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_cta_path_idx\` ON \`case_studies_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_cta_cta_fields_cta_fields_banner_ima_idx\` ON \`case_studies_blocks_cta\` (\`cta_fields_banner_image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_card_grid_card_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_card_grid_card_grid_fields_links_order_idx\` ON \`case_studies_blocks_card_grid_card_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_card_grid_card_grid_fields_links_parent_id_idx\` ON \`case_studies_blocks_card_grid_card_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_card_grid_card_grid_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_card_grid_card_grid_fields_cards_order_idx\` ON \`case_studies_blocks_card_grid_card_grid_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_card_grid_card_grid_fields_cards_parent_id_idx\` ON \`case_studies_blocks_card_grid_card_grid_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`card_grid_fields_settings_theme\` text,
  	\`card_grid_fields_settings_background\` text,
  	\`card_grid_fields_rich_text\` text,
  	\`card_grid_fields_reveal_description\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_card_grid_order_idx\` ON \`case_studies_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_card_grid_parent_id_idx\` ON \`case_studies_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_card_grid_path_idx\` ON \`case_studies_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content_fields_settings_theme\` text,
  	\`content_fields_settings_background\` text,
  	\`content_fields_use_leading_header\` integer,
  	\`content_fields_leading_header\` text,
  	\`content_fields_layout\` text DEFAULT 'oneColumn',
  	\`content_fields_column_one\` text,
  	\`content_fields_column_two\` text,
  	\`content_fields_column_three\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_content_order_idx\` ON \`case_studies_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_content_parent_id_idx\` ON \`case_studies_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_content_path_idx\` ON \`case_studies_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`form_fields_settings_theme\` text,
  	\`form_fields_settings_background\` text,
  	\`form_fields_rich_text\` text,
  	\`form_fields_form_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`form_fields_form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_form_order_idx\` ON \`case_studies_blocks_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_form_parent_id_idx\` ON \`case_studies_blocks_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_form_path_idx\` ON \`case_studies_blocks_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_form_form_fields_form_fields_form_idx\` ON \`case_studies_blocks_form\` (\`form_fields_form_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_hover_cards_hover_cards_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies_blocks_hover_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_hover_cards_hover_cards_fields_cards_order_idx\` ON \`case_studies_blocks_hover_cards_hover_cards_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_hover_cards_hover_cards_fields_cards_parent_id_idx\` ON \`case_studies_blocks_hover_cards_hover_cards_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_hover_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hover_cards_fields_settings_theme\` text,
  	\`hover_cards_fields_settings_background\` text,
  	\`hover_cards_fields_hide_background\` integer,
  	\`hover_cards_fields_rich_text\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_hover_cards_order_idx\` ON \`case_studies_blocks_hover_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_hover_cards_parent_id_idx\` ON \`case_studies_blocks_hover_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_hover_cards_path_idx\` ON \`case_studies_blocks_hover_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_link_grid_link_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies_blocks_link_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_link_grid_link_grid_fields_links_order_idx\` ON \`case_studies_blocks_link_grid_link_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_link_grid_link_grid_fields_links_parent_id_idx\` ON \`case_studies_blocks_link_grid_link_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_link_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_grid_fields_settings_theme\` text,
  	\`link_grid_fields_settings_background\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_link_grid_order_idx\` ON \`case_studies_blocks_link_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_link_grid_parent_id_idx\` ON \`case_studies_blocks_link_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_link_grid_path_idx\` ON \`case_studies_blocks_link_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_logo_grid_logo_grid_fields_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`logo_media_id\` integer,
  	FOREIGN KEY (\`logo_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies_blocks_logo_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_logo_grid_logo_grid_fields_logos_order_idx\` ON \`case_studies_blocks_logo_grid_logo_grid_fields_logos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_logo_grid_logo_grid_fields_logos_parent_id_idx\` ON \`case_studies_blocks_logo_grid_logo_grid_fields_logos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_logo_grid_logo_grid_fields_logos_log_idx\` ON \`case_studies_blocks_logo_grid_logo_grid_fields_logos\` (\`logo_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_logo_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`logo_grid_fields_settings_theme\` text,
  	\`logo_grid_fields_settings_background\` text,
  	\`logo_grid_fields_rich_text\` text,
  	\`logo_grid_fields_enable_link\` integer,
  	\`logo_grid_fields_link_type\` text DEFAULT 'reference',
  	\`logo_grid_fields_link_new_tab\` integer,
  	\`logo_grid_fields_link_url\` text,
  	\`logo_grid_fields_link_label\` text,
  	\`logo_grid_fields_link_custom_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_logo_grid_order_idx\` ON \`case_studies_blocks_logo_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_logo_grid_parent_id_idx\` ON \`case_studies_blocks_logo_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_logo_grid_path_idx\` ON \`case_studies_blocks_logo_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_reusable_content_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`reusable_content_block_fields_settings_theme\` text,
  	\`reusable_content_block_fields_settings_background\` text,
  	\`reusable_content_block_fields_reusable_content_id\` integer,
  	\`reusable_content_block_fields_custom_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`reusable_content_block_fields_reusable_content_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_reusable_content_block_order_idx\` ON \`case_studies_blocks_reusable_content_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_reusable_content_block_parent_id_idx\` ON \`case_studies_blocks_reusable_content_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_reusable_content_block_path_idx\` ON \`case_studies_blocks_reusable_content_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_reusable_content_block_reusable_cont_idx\` ON \`case_studies_blocks_reusable_content_block\` (\`reusable_content_block_fields_reusable_content_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_slider_slider_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_slider_slider_fields_links_order_idx\` ON \`case_studies_blocks_slider_slider_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_slider_slider_fields_links_parent_id_idx\` ON \`case_studies_blocks_slider_slider_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_slider_slider_fields_quote_slides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`author\` text,
  	\`role\` text,
  	\`logo_id\` integer,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_slider_slider_fields_quote_slides_order_idx\` ON \`case_studies_blocks_slider_slider_fields_quote_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_slider_slider_fields_quote_slides_parent_id_idx\` ON \`case_studies_blocks_slider_slider_fields_quote_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_slider_slider_fields_quote_slides_lo_idx\` ON \`case_studies_blocks_slider_slider_fields_quote_slides\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slider_fields_settings_theme\` text,
  	\`slider_fields_settings_background\` text,
  	\`slider_fields_intro_content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_slider_order_idx\` ON \`case_studies_blocks_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_slider_parent_id_idx\` ON \`case_studies_blocks_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_slider_path_idx\` ON \`case_studies_blocks_slider\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_steps_steps_fields_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`media_id\` integer,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies_blocks_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_steps_steps_fields_steps_order_idx\` ON \`case_studies_blocks_steps_steps_fields_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_steps_steps_fields_steps_parent_id_idx\` ON \`case_studies_blocks_steps_steps_fields_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_steps_steps_fields_steps_media_idx\` ON \`case_studies_blocks_steps_steps_fields_steps\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`steps_fields_settings_theme\` text,
  	\`steps_fields_settings_background\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_steps_order_idx\` ON \`case_studies_blocks_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_steps_parent_id_idx\` ON \`case_studies_blocks_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_steps_path_idx\` ON \`case_studies_blocks_steps\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_code_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`code\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_code_example_block_order_idx\` ON \`case_studies_blocks_code_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_code_example_block_parent_id_idx\` ON \`case_studies_blocks_code_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_code_example_block_path_idx\` ON \`case_studies_blocks_code_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_media_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_media_example_block_order_idx\` ON \`case_studies_blocks_media_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_media_example_block_parent_id_idx\` ON \`case_studies_blocks_media_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_media_example_block_path_idx\` ON \`case_studies_blocks_media_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_media_example_block_media_idx\` ON \`case_studies_blocks_media_example_block\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_example_tabs_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`content\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies_blocks_example_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_example_tabs_tabs_order_idx\` ON \`case_studies_blocks_example_tabs_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_example_tabs_tabs_parent_id_idx\` ON \`case_studies_blocks_example_tabs_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_blocks_example_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_example_tabs_order_idx\` ON \`case_studies_blocks_example_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_example_tabs_parent_id_idx\` ON \`case_studies_blocks_example_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_blocks_example_tabs_path_idx\` ON \`case_studies_blocks_example_tabs\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`intro_content\` text,
  	\`industry\` text,
  	\`use_case\` text,
  	\`partner_id\` integer,
  	\`featured_image_id\` integer,
  	\`slug\` text,
  	\`url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`partner_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_partner_idx\` ON \`case_studies\` (\`partner_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_featured_image_idx\` ON \`case_studies\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_slug_idx\` ON \`case_studies\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_updated_at_idx\` ON \`case_studies\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_created_at_idx\` ON \`case_studies\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies__status_idx\` ON \`case_studies\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_meta_meta_image_idx\` ON \`case_studies_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`case_studies_locales_locale_parent_id_unique\` ON \`case_studies_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`case_studies_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_rels_order_idx\` ON \`case_studies_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_rels_parent_idx\` ON \`case_studies_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_rels_path_idx\` ON \`case_studies_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_rels_pages_id_idx\` ON \`case_studies_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_rels_posts_id_idx\` ON \`case_studies_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`case_studies_rels_case_studies_id_idx\` ON \`case_studies_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_co_v_callout_fields_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_co_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_co_v_callout_fields_images_order_idx\` ON \`_co_v_callout_fields_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_co_v_callout_fields_images_parent_id_idx\` ON \`_co_v_callout_fields_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_co_v_callout_fields_images_image_idx\` ON \`_co_v_callout_fields_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_co_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`callout_fields_settings_theme\` text,
  	\`callout_fields_settings_background\` text,
  	\`callout_fields_rich_text\` text,
  	\`callout_fields_logo_id\` integer,
  	\`callout_fields_author\` text,
  	\`callout_fields_role\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`callout_fields_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_co_v_order_idx\` ON \`_co_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_co_v_parent_id_idx\` ON \`_co_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_co_v_path_idx\` ON \`_co_v\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_co_v_callout_fields_callout_fields_logo_idx\` ON \`_co_v\` (\`callout_fields_logo_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_cta_cta_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'link',
  	\`npm_cta_label\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_cta_cta_fields_links_order_idx\` ON \`_case_studies_v_blocks_cta_cta_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_cta_cta_fields_links_parent_id_idx\` ON \`_case_studies_v_blocks_cta_cta_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cta_fields_settings_theme\` text,
  	\`cta_fields_settings_background\` text,
  	\`cta_fields_style\` text DEFAULT 'buttons',
  	\`cta_fields_rich_text\` text,
  	\`cta_fields_command_line\` text,
  	\`cta_fields_banner_link_type\` text DEFAULT 'reference',
  	\`cta_fields_banner_link_new_tab\` integer,
  	\`cta_fields_banner_link_url\` text,
  	\`cta_fields_banner_link_label\` text,
  	\`cta_fields_banner_link_custom_id\` text,
  	\`cta_fields_banner_image_id\` integer,
  	\`cta_fields_gradient_background\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`cta_fields_banner_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_cta_order_idx\` ON \`_case_studies_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_cta_parent_id_idx\` ON \`_case_studies_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_cta_path_idx\` ON \`_case_studies_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_cta_cta_fields_cta_fields_banner__idx\` ON \`_case_studies_v_blocks_cta\` (\`cta_fields_banner_image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_card_grid_card_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_card_grid_card_grid_fields_links_order_idx\` ON \`_case_studies_v_blocks_card_grid_card_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_card_grid_card_grid_fields_links_parent_id_idx\` ON \`_case_studies_v_blocks_card_grid_card_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_card_grid_card_grid_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_card_grid_card_grid_fields_cards_order_idx\` ON \`_case_studies_v_blocks_card_grid_card_grid_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_card_grid_card_grid_fields_cards_parent_id_idx\` ON \`_case_studies_v_blocks_card_grid_card_grid_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`card_grid_fields_settings_theme\` text,
  	\`card_grid_fields_settings_background\` text,
  	\`card_grid_fields_rich_text\` text,
  	\`card_grid_fields_reveal_description\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_card_grid_order_idx\` ON \`_case_studies_v_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_card_grid_parent_id_idx\` ON \`_case_studies_v_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_card_grid_path_idx\` ON \`_case_studies_v_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_csc_v_case_study_card_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`rich_text\` text,
  	\`case_study_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`case_study_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_csc_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csc_v_case_study_card_fields_cards_order_idx\` ON \`_csc_v_case_study_card_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csc_v_case_study_card_fields_cards_parent_id_idx\` ON \`_csc_v_case_study_card_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csc_v_case_study_card_fields_cards_case_study_idx\` ON \`_csc_v_case_study_card_fields_cards\` (\`case_study_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_csc_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`case_study_card_fields_settings_theme\` text,
  	\`case_study_card_fields_settings_background\` text,
  	\`case_study_card_fields_pixels\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csc_v_order_idx\` ON \`_csc_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csc_v_parent_id_idx\` ON \`_csc_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csc_v_path_idx\` ON \`_csc_v\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_csh_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`case_studies_highlight_fields_settings_theme\` text,
  	\`case_studies_highlight_fields_settings_background\` text,
  	\`case_studies_highlight_fields_rich_text\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csh_v_order_idx\` ON \`_csh_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csh_v_parent_id_idx\` ON \`_csh_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csh_v_path_idx\` ON \`_csh_v\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_csp_v_case_study_parallax_fields_items_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_csp_v_case_study_parallax_fields_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csp_v_case_study_parallax_fields_items_images_order_idx\` ON \`_csp_v_case_study_parallax_fields_items_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csp_v_case_study_parallax_fields_items_images_parent_id_idx\` ON \`_csp_v_case_study_parallax_fields_items_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csp_v_case_study_parallax_fields_items_images_image_idx\` ON \`_csp_v_case_study_parallax_fields_items_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_csp_v_case_study_parallax_fields_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`author\` text,
  	\`logo_id\` integer,
  	\`tab_label\` text,
  	\`case_study_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`case_study_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_csp_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csp_v_case_study_parallax_fields_items_order_idx\` ON \`_csp_v_case_study_parallax_fields_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csp_v_case_study_parallax_fields_items_parent_id_idx\` ON \`_csp_v_case_study_parallax_fields_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csp_v_case_study_parallax_fields_items_logo_idx\` ON \`_csp_v_case_study_parallax_fields_items\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csp_v_case_study_parallax_fields_items_case_study_idx\` ON \`_csp_v_case_study_parallax_fields_items\` (\`case_study_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_csp_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`case_study_parallax_fields_settings_theme\` text,
  	\`case_study_parallax_fields_settings_background\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csp_v_order_idx\` ON \`_csp_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csp_v_parent_id_idx\` ON \`_csp_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_csp_v_path_idx\` ON \`_csp_v\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_cdf_v_code_feature_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_cdf_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cdf_v_code_feature_fields_links_order_idx\` ON \`_cdf_v_code_feature_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cdf_v_code_feature_fields_links_parent_id_idx\` ON \`_cdf_v_code_feature_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_cdf_v_code_feature_fields_code_tabs_code_blips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`row\` numeric,
  	\`label\` text,
  	\`feature\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_cdf_v_code_feature_fields_code_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cdf_v_code_feature_fields_code_tabs_code_blips_order_idx\` ON \`_cdf_v_code_feature_fields_code_tabs_code_blips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cdf_v_code_feature_fields_code_tabs_code_blips_parent_id_idx\` ON \`_cdf_v_code_feature_fields_code_tabs_code_blips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_cdf_v_code_feature_fields_code_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`language\` text DEFAULT 'none',
  	\`label\` text,
  	\`code\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_cdf_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cdf_v_code_feature_fields_code_tabs_order_idx\` ON \`_cdf_v_code_feature_fields_code_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cdf_v_code_feature_fields_code_tabs_parent_id_idx\` ON \`_cdf_v_code_feature_fields_code_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_cdf_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`code_feature_fields_settings_theme\` text,
  	\`code_feature_fields_settings_background\` text,
  	\`code_feature_fields_force_dark_background\` integer,
  	\`code_feature_fields_alignment\` text DEFAULT 'contentCode',
  	\`code_feature_fields_heading\` text,
  	\`code_feature_fields_rich_text\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cdf_v_order_idx\` ON \`_cdf_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cdf_v_parent_id_idx\` ON \`_cdf_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cdf_v_path_idx\` ON \`_cdf_v\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content_fields_settings_theme\` text,
  	\`content_fields_settings_background\` text,
  	\`content_fields_use_leading_header\` integer,
  	\`content_fields_leading_header\` text,
  	\`content_fields_layout\` text DEFAULT 'oneColumn',
  	\`content_fields_column_one\` text,
  	\`content_fields_column_two\` text,
  	\`content_fields_column_three\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_content_order_idx\` ON \`_case_studies_v_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_content_parent_id_idx\` ON \`_case_studies_v_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_content_path_idx\` ON \`_case_studies_v_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_cgr_v_content_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_cgr_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cgr_v_content_grid_fields_links_order_idx\` ON \`_cgr_v_content_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cgr_v_content_grid_fields_links_parent_id_idx\` ON \`_cgr_v_content_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_cgr_v_content_grid_fields_cells\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_cgr_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cgr_v_content_grid_fields_cells_order_idx\` ON \`_cgr_v_content_grid_fields_cells\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cgr_v_content_grid_fields_cells_parent_id_idx\` ON \`_cgr_v_content_grid_fields_cells\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_cgr_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content_grid_fields_settings_theme\` text,
  	\`content_grid_fields_settings_background\` text,
  	\`content_grid_fields_style\` text DEFAULT 'gridBelow',
  	\`content_grid_fields_show_numbers\` integer,
  	\`content_grid_fields_content\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cgr_v_order_idx\` ON \`_cgr_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cgr_v_parent_id_idx\` ON \`_cgr_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cgr_v_path_idx\` ON \`_cgr_v\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`form_fields_settings_theme\` text,
  	\`form_fields_settings_background\` text,
  	\`form_fields_rich_text\` text,
  	\`form_fields_form_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`form_fields_form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_form_order_idx\` ON \`_case_studies_v_blocks_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_form_parent_id_idx\` ON \`_case_studies_v_blocks_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_form_path_idx\` ON \`_case_studies_v_blocks_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_form_form_fields_form_fields_form_idx\` ON \`_case_studies_v_blocks_form\` (\`form_fields_form_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_hover_cards_hover_cards_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v_blocks_hover_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_hover_cards_hover_cards_fields_cards_order_idx\` ON \`_case_studies_v_blocks_hover_cards_hover_cards_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_hover_cards_hover_cards_fields_cards_parent_id_idx\` ON \`_case_studies_v_blocks_hover_cards_hover_cards_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_hover_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hover_cards_fields_settings_theme\` text,
  	\`hover_cards_fields_settings_background\` text,
  	\`hover_cards_fields_hide_background\` integer,
  	\`hover_cards_fields_rich_text\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_hover_cards_order_idx\` ON \`_case_studies_v_blocks_hover_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_hover_cards_parent_id_idx\` ON \`_case_studies_v_blocks_hover_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_hover_cards_path_idx\` ON \`_case_studies_v_blocks_hover_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_hhl_highlight_rows_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`media_top_id\` integer,
  	\`media_bottom_id\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`media_top_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`media_bottom_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_hhl_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_hhl_highlight_rows_v_order_idx\` ON \`_hhl_highlight_rows_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_hhl_highlight_rows_v_parent_id_idx\` ON \`_hhl_highlight_rows_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_hhl_highlight_rows_v_media_media_top_idx\` ON \`_hhl_highlight_rows_v\` (\`media_top_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_hhl_highlight_rows_v_media_media_bottom_idx\` ON \`_hhl_highlight_rows_v\` (\`media_bottom_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_hhl_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hover_highlights_fields_settings_theme\` text,
  	\`hover_highlights_fields_settings_background\` text,
  	\`hover_highlights_fields_before_highlights\` text,
  	\`hover_highlights_fields_after_highlights\` text,
  	\`hover_highlights_fields_link_type\` text DEFAULT 'reference',
  	\`hover_highlights_fields_link_new_tab\` integer,
  	\`hover_highlights_fields_link_url\` text,
  	\`hover_highlights_fields_link_label\` text,
  	\`hover_highlights_fields_link_custom_id\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_hhl_v_order_idx\` ON \`_hhl_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_hhl_v_parent_id_idx\` ON \`_hhl_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_hhl_v_path_idx\` ON \`_hhl_v\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_link_grid_link_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v_blocks_link_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_link_grid_link_grid_fields_links_order_idx\` ON \`_case_studies_v_blocks_link_grid_link_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_link_grid_link_grid_fields_links_parent_id_idx\` ON \`_case_studies_v_blocks_link_grid_link_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_link_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_grid_fields_settings_theme\` text,
  	\`link_grid_fields_settings_background\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_link_grid_order_idx\` ON \`_case_studies_v_blocks_link_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_link_grid_parent_id_idx\` ON \`_case_studies_v_blocks_link_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_link_grid_path_idx\` ON \`_case_studies_v_blocks_link_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_logo_grid_logo_grid_fields_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_media_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v_blocks_logo_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_logo_grid_logo_grid_fields_logos_order_idx\` ON \`_case_studies_v_blocks_logo_grid_logo_grid_fields_logos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_logo_grid_logo_grid_fields_logos_parent_id_idx\` ON \`_case_studies_v_blocks_logo_grid_logo_grid_fields_logos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_logo_grid_logo_grid_fields_logos__idx\` ON \`_case_studies_v_blocks_logo_grid_logo_grid_fields_logos\` (\`logo_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_logo_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_grid_fields_settings_theme\` text,
  	\`logo_grid_fields_settings_background\` text,
  	\`logo_grid_fields_rich_text\` text,
  	\`logo_grid_fields_enable_link\` integer,
  	\`logo_grid_fields_link_type\` text DEFAULT 'reference',
  	\`logo_grid_fields_link_new_tab\` integer,
  	\`logo_grid_fields_link_url\` text,
  	\`logo_grid_fields_link_label\` text,
  	\`logo_grid_fields_link_custom_id\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_logo_grid_order_idx\` ON \`_case_studies_v_blocks_logo_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_logo_grid_parent_id_idx\` ON \`_case_studies_v_blocks_logo_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_logo_grid_path_idx\` ON \`_case_studies_v_blocks_logo_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_mb_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_block_fields_settings_theme\` text,
  	\`media_block_fields_settings_background\` text,
  	\`media_block_fields_position\` text DEFAULT 'default',
  	\`media_block_fields_media_id\` integer,
  	\`media_block_fields_caption\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_block_fields_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mb_v_order_idx\` ON \`_mb_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mb_v_parent_id_idx\` ON \`_mb_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mb_v_path_idx\` ON \`_mb_v\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mb_v_media_block_fields_media_block_fields_media_idx\` ON \`_mb_v\` (\`media_block_fields_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_mcnt_v_media_content_fields_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_mcnt_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mcnt_v_media_content_fields_images_order_idx\` ON \`_mcnt_v_media_content_fields_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mcnt_v_media_content_fields_images_parent_id_idx\` ON \`_mcnt_v_media_content_fields_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mcnt_v_media_content_fields_images_image_idx\` ON \`_mcnt_v_media_content_fields_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_mcnt_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_content_fields_settings_theme\` text,
  	\`media_content_fields_settings_background\` text,
  	\`media_content_fields_alignment\` text DEFAULT 'contentMedia',
  	\`media_content_fields_media_width\` text DEFAULT 'stretch',
  	\`media_content_fields_rich_text\` text,
  	\`media_content_fields_enable_link\` integer,
  	\`media_content_fields_link_type\` text DEFAULT 'reference',
  	\`media_content_fields_link_new_tab\` integer,
  	\`media_content_fields_link_url\` text,
  	\`media_content_fields_link_label\` text,
  	\`media_content_fields_link_custom_id\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mcnt_v_order_idx\` ON \`_mcnt_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mcnt_v_parent_id_idx\` ON \`_mcnt_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mcnt_v_path_idx\` ON \`_mcnt_v\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_mca_v_media_content_accordion_fields_accordion\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`position\` text DEFAULT 'normal',
  	\`background\` text DEFAULT 'none',
  	\`media_label\` text,
  	\`media_description\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_mca_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mca_v_media_content_accordion_fields_accordion_order_idx\` ON \`_mca_v_media_content_accordion_fields_accordion\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mca_v_media_content_accordion_fields_accordion_parent_id_idx\` ON \`_mca_v_media_content_accordion_fields_accordion\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mca_v_media_content_accordion_fields_accordion_media_idx\` ON \`_mca_v_media_content_accordion_fields_accordion\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_mca_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_content_accordion_fields_settings_theme\` text,
  	\`media_content_accordion_fields_settings_background\` text,
  	\`media_content_accordion_fields_alignment\` text DEFAULT 'contentMedia',
  	\`media_content_accordion_fields_leader\` text,
  	\`media_content_accordion_fields_heading\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mca_v_order_idx\` ON \`_mca_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mca_v_parent_id_idx\` ON \`_mca_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_mca_v_path_idx\` ON \`_mca_v\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_feats_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`feature\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_tiers_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_feats_v_order_idx\` ON \`_feats_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_feats_v_parent_id_idx\` ON \`_feats_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_tiers_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`has_price\` integer,
  	\`enable_create_payload\` integer,
  	\`price\` text,
  	\`title\` text,
  	\`description\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_prc_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_tiers_v_order_idx\` ON \`_tiers_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_tiers_v_parent_id_idx\` ON \`_tiers_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_prc_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`pricing_fields_settings_theme\` text,
  	\`pricing_fields_settings_background\` text,
  	\`pricing_fields_disclaimer\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_prc_v_order_idx\` ON \`_prc_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_prc_v_parent_id_idx\` ON \`_prc_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_prc_v_path_idx\` ON \`_prc_v\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_reusable_content_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`reusable_content_block_fields_settings_theme\` text,
  	\`reusable_content_block_fields_settings_background\` text,
  	\`reusable_content_block_fields_reusable_content_id\` integer,
  	\`reusable_content_block_fields_custom_id\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`reusable_content_block_fields_reusable_content_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_reusable_content_block_order_idx\` ON \`_case_studies_v_blocks_reusable_content_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_reusable_content_block_parent_id_idx\` ON \`_case_studies_v_blocks_reusable_content_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_reusable_content_block_path_idx\` ON \`_case_studies_v_blocks_reusable_content_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_reusable_content_block_reusable_c_idx\` ON \`_case_studies_v_blocks_reusable_content_block\` (\`reusable_content_block_fields_reusable_content_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_slider_slider_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_slider_slider_fields_links_order_idx\` ON \`_case_studies_v_blocks_slider_slider_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_slider_slider_fields_links_parent_id_idx\` ON \`_case_studies_v_blocks_slider_slider_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_slider_slider_fields_quote_slides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`author\` text,
  	\`role\` text,
  	\`logo_id\` integer,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_slider_slider_fields_quote_slides_order_idx\` ON \`_case_studies_v_blocks_slider_slider_fields_quote_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_slider_slider_fields_quote_slides_parent_id_idx\` ON \`_case_studies_v_blocks_slider_slider_fields_quote_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_slider_slider_fields_quote_slides_idx\` ON \`_case_studies_v_blocks_slider_slider_fields_quote_slides\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slider_fields_settings_theme\` text,
  	\`slider_fields_settings_background\` text,
  	\`slider_fields_intro_content\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_slider_order_idx\` ON \`_case_studies_v_blocks_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_slider_parent_id_idx\` ON \`_case_studies_v_blocks_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_slider_path_idx\` ON \`_case_studies_v_blocks_slider\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_stm_v_statement_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_stm_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_stm_v_statement_fields_links_order_idx\` ON \`_stm_v_statement_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_stm_v_statement_fields_links_parent_id_idx\` ON \`_stm_v_statement_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_stm_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`statement_fields_settings_theme\` text,
  	\`statement_fields_settings_background\` text,
  	\`statement_fields_rich_text\` text,
  	\`statement_fields_asset_type\` text DEFAULT 'media',
  	\`statement_fields_media_id\` integer,
  	\`statement_fields_code\` text,
  	\`statement_fields_media_width\` text DEFAULT 'medium',
  	\`statement_fields_background_glow\` text DEFAULT 'none',
  	\`statement_fields_asset_caption\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`statement_fields_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_stm_v_order_idx\` ON \`_stm_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_stm_v_parent_id_idx\` ON \`_stm_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_stm_v_path_idx\` ON \`_stm_v\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_stm_v_statement_fields_statement_fields_media_idx\` ON \`_stm_v\` (\`statement_fields_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_steps_steps_fields_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v_blocks_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_steps_steps_fields_steps_order_idx\` ON \`_case_studies_v_blocks_steps_steps_fields_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_steps_steps_fields_steps_parent_id_idx\` ON \`_case_studies_v_blocks_steps_steps_fields_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_steps_steps_fields_steps_media_idx\` ON \`_case_studies_v_blocks_steps_steps_fields_steps\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`steps_fields_settings_theme\` text,
  	\`steps_fields_settings_background\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_steps_order_idx\` ON \`_case_studies_v_blocks_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_steps_parent_id_idx\` ON \`_case_studies_v_blocks_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_steps_path_idx\` ON \`_case_studies_v_blocks_steps\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_rows_v_code_blips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`row\` numeric,
  	\`label\` text,
  	\`feature\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rows_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_rows_v_code_blips_order_idx\` ON \`_rows_v_code_blips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_rows_v_code_blips_parent_id_idx\` ON \`_rows_v_code_blips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_rows_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`rich_text\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`type\` text,
  	\`code\` text,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_shl_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_rows_v_order_idx\` ON \`_rows_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_rows_v_parent_id_idx\` ON \`_rows_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_rows_v_media_idx\` ON \`_rows_v\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_shl_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`sticky_highlights_fields_settings_theme\` text,
  	\`sticky_highlights_fields_settings_background\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_shl_v_order_idx\` ON \`_shl_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_shl_v_parent_id_idx\` ON \`_shl_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_shl_v_path_idx\` ON \`_shl_v\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_code_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`code\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_code_example_block_order_idx\` ON \`_case_studies_v_blocks_code_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_code_example_block_parent_id_idx\` ON \`_case_studies_v_blocks_code_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_code_example_block_path_idx\` ON \`_case_studies_v_blocks_code_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_media_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_media_example_block_order_idx\` ON \`_case_studies_v_blocks_media_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_media_example_block_parent_id_idx\` ON \`_case_studies_v_blocks_media_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_media_example_block_path_idx\` ON \`_case_studies_v_blocks_media_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_media_example_block_media_idx\` ON \`_case_studies_v_blocks_media_example_block\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_example_tabs_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`content\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v_blocks_example_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_example_tabs_tabs_order_idx\` ON \`_case_studies_v_blocks_example_tabs_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_example_tabs_tabs_parent_id_idx\` ON \`_case_studies_v_blocks_example_tabs_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_blocks_example_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_example_tabs_order_idx\` ON \`_case_studies_v_blocks_example_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_example_tabs_parent_id_idx\` ON \`_case_studies_v_blocks_example_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_blocks_example_tabs_path_idx\` ON \`_case_studies_v_blocks_example_tabs\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_intro_content\` text,
  	\`version_industry\` text,
  	\`version_use_case\` text,
  	\`version_partner_id\` integer,
  	\`version_featured_image_id\` integer,
  	\`version_slug\` text,
  	\`version_url\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_partner_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_parent_idx\` ON \`_case_studies_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_version_version_partner_idx\` ON \`_case_studies_v\` (\`version_partner_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_version_version_featured_image_idx\` ON \`_case_studies_v\` (\`version_featured_image_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_version_version_slug_idx\` ON \`_case_studies_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_version_version_updated_at_idx\` ON \`_case_studies_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_version_version_created_at_idx\` ON \`_case_studies_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_version_version__status_idx\` ON \`_case_studies_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_created_at_idx\` ON \`_case_studies_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_updated_at_idx\` ON \`_case_studies_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_snapshot_idx\` ON \`_case_studies_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_published_locale_idx\` ON \`_case_studies_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_latest_idx\` ON \`_case_studies_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_locales\` (
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_version_meta_version_meta_image_idx\` ON \`_case_studies_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_case_studies_v_locales_locale_parent_id_unique\` ON \`_case_studies_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_case_studies_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_rels_order_idx\` ON \`_case_studies_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_rels_parent_idx\` ON \`_case_studies_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_rels_path_idx\` ON \`_case_studies_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_rels_pages_id_idx\` ON \`_case_studies_v_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_rels_posts_id_idx\` ON \`_case_studies_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_case_studies_v_rels_case_studies_id_idx\` ON \`_case_studies_v_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`community_help\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`community_help_type\` text,
  	\`github_id\` text,
  	\`discord_id\` text,
  	\`community_help_j_s_o_n\` text NOT NULL,
  	\`intro_description\` text,
  	\`slug\` text,
  	\`helpful\` integer,
  	\`thread_created_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`community_help_github_id_idx\` ON \`community_help\` (\`github_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`community_help_discord_id_idx\` ON \`community_help\` (\`discord_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`community_help_slug_idx\` ON \`community_help\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`community_help_updated_at_idx\` ON \`community_help\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`community_help_created_at_idx\` ON \`community_help\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`community_help_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`docs_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`community_help\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`docs_id\`) REFERENCES \`docs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`community_help_rels_order_idx\` ON \`community_help_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`community_help_rels_parent_idx\` ON \`community_help_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`community_help_rels_path_idx\` ON \`community_help_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`community_help_rels_docs_id_idx\` ON \`community_help_rels\` (\`docs_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts_blocks_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`banner_fields_settings_theme\` text,
  	\`banner_fields_settings_background\` text,
  	\`banner_fields_type\` text DEFAULT 'default',
  	\`banner_fields_add_checkmark\` integer,
  	\`banner_fields_content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_banner_order_idx\` ON \`posts_blocks_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_banner_parent_id_idx\` ON \`posts_blocks_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_banner_path_idx\` ON \`posts_blocks_banner\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts_blocks_blog_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`blog_content_fields_settings_theme\` text,
  	\`blog_content_fields_settings_background\` text,
  	\`blog_content_fields_rich_text\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_blog_content_order_idx\` ON \`posts_blocks_blog_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_blog_content_parent_id_idx\` ON \`posts_blocks_blog_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_blog_content_path_idx\` ON \`posts_blocks_blog_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts_blocks_code_code_fields_code_blips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`row\` numeric,
  	\`label\` text,
  	\`feature\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_code\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_code_code_fields_code_blips_order_idx\` ON \`posts_blocks_code_code_fields_code_blips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_code_code_fields_code_blips_parent_id_idx\` ON \`posts_blocks_code_code_fields_code_blips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts_blocks_code\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`code_fields_settings_theme\` text,
  	\`code_fields_settings_background\` text,
  	\`code_fields_language\` text DEFAULT 'none',
  	\`code_fields_code\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_code_order_idx\` ON \`posts_blocks_code\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_code_parent_id_idx\` ON \`posts_blocks_code\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_code_path_idx\` ON \`posts_blocks_code\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts_blocks_blog_markdown\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`blog_markdown_fields_settings_theme\` text,
  	\`blog_markdown_fields_settings_background\` text,
  	\`blog_markdown_fields_markdown\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_blog_markdown_order_idx\` ON \`posts_blocks_blog_markdown\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_blog_markdown_parent_id_idx\` ON \`posts_blocks_blog_markdown\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_blog_markdown_path_idx\` ON \`posts_blocks_blog_markdown\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts_blocks_reusable_content_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`reusable_content_block_fields_settings_theme\` text,
  	\`reusable_content_block_fields_settings_background\` text,
  	\`reusable_content_block_fields_reusable_content_id\` integer,
  	\`reusable_content_block_fields_custom_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`reusable_content_block_fields_reusable_content_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_reusable_content_block_order_idx\` ON \`posts_blocks_reusable_content_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_reusable_content_block_parent_id_idx\` ON \`posts_blocks_reusable_content_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_reusable_content_block_path_idx\` ON \`posts_blocks_reusable_content_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_blocks_reusable_content_block_reusable_content_blo_idx\` ON \`posts_blocks_reusable_content_block\` (\`reusable_content_block_fields_reusable_content_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`featured_media\` text DEFAULT 'upload',
  	\`image_id\` integer,
  	\`video_url\` text,
  	\`dynamic_thumbnail\` integer DEFAULT true,
  	\`thumbnail_id\` integer,
  	\`category_id\` integer,
  	\`excerpt\` text,
  	\`slug\` text,
  	\`author_type\` text DEFAULT 'team',
  	\`guest_author\` text,
  	\`guest_socials_youtube\` text,
  	\`guest_socials_twitter\` text,
  	\`guest_socials_linkedin\` text,
  	\`guest_socials_website\` text,
  	\`published_on\` text,
  	\`add_to_docs\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_image_idx\` ON \`posts\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_thumbnail_idx\` ON \`posts\` (\`thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_category_idx\` ON \`posts\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_slug_idx\` ON \`posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_updated_at_idx\` ON \`posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_created_at_idx\` ON \`posts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts__status_idx\` ON \`posts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_meta_meta_image_idx\` ON \`posts_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`posts_locales_locale_parent_id_unique\` ON \`posts_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_texts_order_parent\` ON \`posts_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	\`docs_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`docs_id\`) REFERENCES \`docs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_rels_order_idx\` ON \`posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_rels_parent_idx\` ON \`posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_rels_path_idx\` ON \`posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_rels_pages_id_idx\` ON \`posts_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_rels_posts_id_idx\` ON \`posts_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_rels_case_studies_id_idx\` ON \`posts_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_rels_docs_id_idx\` ON \`posts_rels\` (\`docs_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_rels_users_id_idx\` ON \`posts_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_posts_v_blocks_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`banner_fields_settings_theme\` text,
  	\`banner_fields_settings_background\` text,
  	\`banner_fields_type\` text DEFAULT 'default',
  	\`banner_fields_add_checkmark\` integer,
  	\`banner_fields_content\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_banner_order_idx\` ON \`_posts_v_blocks_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_banner_parent_id_idx\` ON \`_posts_v_blocks_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_banner_path_idx\` ON \`_posts_v_blocks_banner\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_posts_v_blocks_blog_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`blog_content_fields_settings_theme\` text,
  	\`blog_content_fields_settings_background\` text,
  	\`blog_content_fields_rich_text\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_blog_content_order_idx\` ON \`_posts_v_blocks_blog_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_blog_content_parent_id_idx\` ON \`_posts_v_blocks_blog_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_blog_content_path_idx\` ON \`_posts_v_blocks_blog_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_posts_v_blocks_code_code_fields_code_blips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`row\` numeric,
  	\`label\` text,
  	\`feature\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_code\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_code_code_fields_code_blips_order_idx\` ON \`_posts_v_blocks_code_code_fields_code_blips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_code_code_fields_code_blips_parent_id_idx\` ON \`_posts_v_blocks_code_code_fields_code_blips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_posts_v_blocks_code\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`code_fields_settings_theme\` text,
  	\`code_fields_settings_background\` text,
  	\`code_fields_language\` text DEFAULT 'none',
  	\`code_fields_code\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_code_order_idx\` ON \`_posts_v_blocks_code\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_code_parent_id_idx\` ON \`_posts_v_blocks_code\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_code_path_idx\` ON \`_posts_v_blocks_code\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_posts_v_blocks_blog_markdown\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`blog_markdown_fields_settings_theme\` text,
  	\`blog_markdown_fields_settings_background\` text,
  	\`blog_markdown_fields_markdown\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_blog_markdown_order_idx\` ON \`_posts_v_blocks_blog_markdown\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_blog_markdown_parent_id_idx\` ON \`_posts_v_blocks_blog_markdown\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_blog_markdown_path_idx\` ON \`_posts_v_blocks_blog_markdown\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_posts_v_blocks_reusable_content_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`reusable_content_block_fields_settings_theme\` text,
  	\`reusable_content_block_fields_settings_background\` text,
  	\`reusable_content_block_fields_reusable_content_id\` integer,
  	\`reusable_content_block_fields_custom_id\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`reusable_content_block_fields_reusable_content_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_reusable_content_block_order_idx\` ON \`_posts_v_blocks_reusable_content_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_reusable_content_block_parent_id_idx\` ON \`_posts_v_blocks_reusable_content_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_reusable_content_block_path_idx\` ON \`_posts_v_blocks_reusable_content_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_blocks_reusable_content_block_reusable_content__idx\` ON \`_posts_v_blocks_reusable_content_block\` (\`reusable_content_block_fields_reusable_content_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_posts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_featured_media\` text DEFAULT 'upload',
  	\`version_image_id\` integer,
  	\`version_video_url\` text,
  	\`version_dynamic_thumbnail\` integer DEFAULT true,
  	\`version_thumbnail_id\` integer,
  	\`version_category_id\` integer,
  	\`version_excerpt\` text,
  	\`version_slug\` text,
  	\`version_author_type\` text DEFAULT 'team',
  	\`version_guest_author\` text,
  	\`version_guest_socials_youtube\` text,
  	\`version_guest_socials_twitter\` text,
  	\`version_guest_socials_linkedin\` text,
  	\`version_guest_socials_website\` text,
  	\`version_published_on\` text,
  	\`version_add_to_docs\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_parent_idx\` ON \`_posts_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_version_version_image_idx\` ON \`_posts_v\` (\`version_image_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_version_version_thumbnail_idx\` ON \`_posts_v\` (\`version_thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_version_version_category_idx\` ON \`_posts_v\` (\`version_category_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_version_version_slug_idx\` ON \`_posts_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_version_version_updated_at_idx\` ON \`_posts_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_version_version_created_at_idx\` ON \`_posts_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_version_version__status_idx\` ON \`_posts_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_created_at_idx\` ON \`_posts_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_updated_at_idx\` ON \`_posts_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_snapshot_idx\` ON \`_posts_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_published_locale_idx\` ON \`_posts_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_latest_idx\` ON \`_posts_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_posts_v_locales\` (
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_version_meta_version_meta_image_idx\` ON \`_posts_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_posts_v_locales_locale_parent_id_unique\` ON \`_posts_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_posts_v_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_texts_order_parent\` ON \`_posts_v_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_posts_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	\`docs_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`docs_id\`) REFERENCES \`docs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_rels_order_idx\` ON \`_posts_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_rels_parent_idx\` ON \`_posts_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_rels_path_idx\` ON \`_posts_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_rels_pages_id_idx\` ON \`_posts_v_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_rels_posts_id_idx\` ON \`_posts_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_rels_case_studies_id_idx\` ON \`_posts_v_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_rels_docs_id_idx\` ON \`_posts_v_rels\` (\`docs_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_posts_v_rels_users_id_idx\` ON \`_posts_v_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`headline\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`categories_created_at_idx\` ON \`categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`docs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`keywords\` text,
  	\`headings\` text,
  	\`path\` text,
  	\`topic\` text NOT NULL,
  	\`topic_group\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`label\` text,
  	\`order\` numeric,
  	\`version\` text NOT NULL,
  	\`mdx\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`docs_updated_at_idx\` ON \`docs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`docs_created_at_idx\` ON \`docs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partners_content_contributions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`repo\` text DEFAULT 'payload',
  	\`number\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_content_contributions_order_idx\` ON \`partners_content_contributions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_content_contributions_parent_id_idx\` ON \`partners_content_contributions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partners_content_projects\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`year\` numeric,
  	\`name\` text,
  	\`link\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_content_projects_order_idx\` ON \`partners_content_projects\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_content_projects_parent_id_idx\` ON \`partners_content_projects\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partners_social\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`platform\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_social_order_idx\` ON \`partners_social\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_social_parent_id_idx\` ON \`partners_social\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partners\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`website\` text,
  	\`email\` text,
  	\`slug\` text,
  	\`agency_status\` text DEFAULT 'active',
  	\`hubspot_id\` text,
  	\`logo_id\` integer,
  	\`featured\` integer,
  	\`top_contributor\` integer,
  	\`content_banner_image_id\` integer,
  	\`content_overview\` text,
  	\`content_services\` text,
  	\`content_ideal_project\` text,
  	\`content_case_study_id\` integer,
  	\`city\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`content_banner_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`content_case_study_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_slug_idx\` ON \`partners\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_logo_idx\` ON \`partners\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_content_content_banner_image_idx\` ON \`partners\` (\`content_banner_image_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_content_content_case_study_idx\` ON \`partners\` (\`content_case_study_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_updated_at_idx\` ON \`partners\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_created_at_idx\` ON \`partners\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners__status_idx\` ON \`partners\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partners_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`regions_id\` integer,
  	\`specialties_id\` integer,
  	\`budgets_id\` integer,
  	\`industries_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`regions_id\`) REFERENCES \`regions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`specialties_id\`) REFERENCES \`specialties\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`budgets_id\`) REFERENCES \`budgets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`industries_id\`) REFERENCES \`industries\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_rels_order_idx\` ON \`partners_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_rels_parent_idx\` ON \`partners_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_rels_path_idx\` ON \`partners_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_rels_regions_id_idx\` ON \`partners_rels\` (\`regions_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_rels_specialties_id_idx\` ON \`partners_rels\` (\`specialties_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_rels_budgets_id_idx\` ON \`partners_rels\` (\`budgets_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partners_rels_industries_id_idx\` ON \`partners_rels\` (\`industries_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_partners_v_version_content_contributions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`repo\` text DEFAULT 'payload',
  	\`number\` numeric,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_partners_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_content_contributions_order_idx\` ON \`_partners_v_version_content_contributions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_content_contributions_parent_id_idx\` ON \`_partners_v_version_content_contributions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_partners_v_version_content_projects\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`year\` numeric,
  	\`name\` text,
  	\`link\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_partners_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_content_projects_order_idx\` ON \`_partners_v_version_content_projects\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_content_projects_parent_id_idx\` ON \`_partners_v_version_content_projects\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_partners_v_version_social\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`platform\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_partners_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_social_order_idx\` ON \`_partners_v_version_social\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_social_parent_id_idx\` ON \`_partners_v_version_social\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_partners_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_name\` text,
  	\`version_website\` text,
  	\`version_email\` text,
  	\`version_slug\` text,
  	\`version_agency_status\` text DEFAULT 'active',
  	\`version_hubspot_id\` text,
  	\`version_logo_id\` integer,
  	\`version_featured\` integer,
  	\`version_top_contributor\` integer,
  	\`version_content_banner_image_id\` integer,
  	\`version_content_overview\` text,
  	\`version_content_services\` text,
  	\`version_content_ideal_project\` text,
  	\`version_content_case_study_id\` integer,
  	\`version_city\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_content_banner_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_content_case_study_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_parent_idx\` ON \`_partners_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_version_slug_idx\` ON \`_partners_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_version_logo_idx\` ON \`_partners_v\` (\`version_logo_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_content_version_content_banner_image_idx\` ON \`_partners_v\` (\`version_content_banner_image_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_content_version_content_case_study_idx\` ON \`_partners_v\` (\`version_content_case_study_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_version_updated_at_idx\` ON \`_partners_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_version_created_at_idx\` ON \`_partners_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_version_version__status_idx\` ON \`_partners_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_created_at_idx\` ON \`_partners_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_updated_at_idx\` ON \`_partners_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_snapshot_idx\` ON \`_partners_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_published_locale_idx\` ON \`_partners_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_latest_idx\` ON \`_partners_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_partners_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`regions_id\` integer,
  	\`specialties_id\` integer,
  	\`budgets_id\` integer,
  	\`industries_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_partners_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`regions_id\`) REFERENCES \`regions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`specialties_id\`) REFERENCES \`specialties\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`budgets_id\`) REFERENCES \`budgets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`industries_id\`) REFERENCES \`industries\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_rels_order_idx\` ON \`_partners_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_rels_parent_idx\` ON \`_partners_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_rels_path_idx\` ON \`_partners_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_rels_regions_id_idx\` ON \`_partners_v_rels\` (\`regions_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_rels_specialties_id_idx\` ON \`_partners_v_rels\` (\`specialties_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_rels_budgets_id_idx\` ON \`_partners_v_rels\` (\`budgets_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_partners_v_rels_industries_id_idx\` ON \`_partners_v_rels\` (\`industries_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`industries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`industries_name_idx\` ON \`industries\` (\`name\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`industries_value_idx\` ON \`industries\` (\`value\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`industries_updated_at_idx\` ON \`industries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`industries_created_at_idx\` ON \`industries\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`specialties\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`specialties_name_idx\` ON \`specialties\` (\`name\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`specialties_value_idx\` ON \`specialties\` (\`value\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`specialties_updated_at_idx\` ON \`specialties\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`specialties_created_at_idx\` ON \`specialties\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`regions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`regions_name_idx\` ON \`regions\` (\`name\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`regions_value_idx\` ON \`regions\` (\`value\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`regions_updated_at_idx\` ON \`regions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`regions_created_at_idx\` ON \`regions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`budgets\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`budgets_name_idx\` ON \`budgets\` (\`name\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`budgets_value_idx\` ON \`budgets\` (\`value\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`budgets_updated_at_idx\` ON \`budgets\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`budgets_created_at_idx\` ON \`budgets\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_hero_breadcrumbs_bar_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_breadcrumbs_bar_links_order_idx\` ON \`pages_hero_breadcrumbs_bar_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_breadcrumbs_bar_links_parent_id_idx\` ON \`pages_hero_breadcrumbs_bar_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_hero_livestream_guests\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`link\` text,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_livestream_guests_order_idx\` ON \`pages_hero_livestream_guests\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_livestream_guests_parent_id_idx\` ON \`pages_hero_livestream_guests\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_livestream_guests_image_idx\` ON \`pages_hero_livestream_guests\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_hero_primary_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'link',
  	\`npm_cta_label\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_primary_buttons_order_idx\` ON \`pages_hero_primary_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_primary_buttons_parent_id_idx\` ON \`pages_hero_primary_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_hero_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_links_order_idx\` ON \`pages_hero_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_links_parent_id_idx\` ON \`pages_hero_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_link\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_link_order_idx\` ON \`pages_blocks_link\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_link_parent_id_idx\` ON \`pages_blocks_link\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_link_path_idx\` ON \`pages_blocks_link\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_command\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`command\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_command_order_idx\` ON \`pages_blocks_command\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_command_parent_id_idx\` ON \`pages_blocks_command\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_command_path_idx\` ON \`pages_blocks_command\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_hero_secondary_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_secondary_buttons_order_idx\` ON \`pages_hero_secondary_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_secondary_buttons_parent_id_idx\` ON \`pages_hero_secondary_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_hero_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_images_order_idx\` ON \`pages_hero_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_images_parent_id_idx\` ON \`pages_hero_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_images_image_idx\` ON \`pages_hero_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_hero_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`logo_media_id\` integer,
  	FOREIGN KEY (\`logo_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_logos_order_idx\` ON \`pages_hero_logos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_logos_parent_id_idx\` ON \`pages_hero_logos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_logos_logo_media_idx\` ON \`pages_hero_logos\` (\`logo_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_cta_cta_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'link',
  	\`npm_cta_label\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_cta_cta_fields_links_order_idx\` ON \`pages_blocks_cta_cta_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_cta_cta_fields_links_parent_id_idx\` ON \`pages_blocks_cta_cta_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`cta_fields_settings_theme\` text,
  	\`cta_fields_settings_background\` text,
  	\`cta_fields_style\` text DEFAULT 'buttons',
  	\`cta_fields_rich_text\` text,
  	\`cta_fields_command_line\` text,
  	\`cta_fields_banner_link_type\` text DEFAULT 'reference',
  	\`cta_fields_banner_link_new_tab\` integer,
  	\`cta_fields_banner_link_url\` text,
  	\`cta_fields_banner_link_label\` text,
  	\`cta_fields_banner_link_custom_id\` text,
  	\`cta_fields_banner_image_id\` integer,
  	\`cta_fields_gradient_background\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`cta_fields_banner_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_cta_order_idx\` ON \`pages_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_cta_parent_id_idx\` ON \`pages_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_cta_path_idx\` ON \`pages_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_cta_cta_fields_cta_fields_banner_image_idx\` ON \`pages_blocks_cta\` (\`cta_fields_banner_image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_card_grid_card_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_card_grid_card_grid_fields_links_order_idx\` ON \`pages_blocks_card_grid_card_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_card_grid_card_grid_fields_links_parent_id_idx\` ON \`pages_blocks_card_grid_card_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_card_grid_card_grid_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_card_grid_card_grid_fields_cards_order_idx\` ON \`pages_blocks_card_grid_card_grid_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_card_grid_card_grid_fields_cards_parent_id_idx\` ON \`pages_blocks_card_grid_card_grid_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`card_grid_fields_settings_theme\` text,
  	\`card_grid_fields_settings_background\` text,
  	\`card_grid_fields_rich_text\` text,
  	\`card_grid_fields_reveal_description\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_card_grid_order_idx\` ON \`pages_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_card_grid_parent_id_idx\` ON \`pages_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_card_grid_path_idx\` ON \`pages_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content_fields_settings_theme\` text,
  	\`content_fields_settings_background\` text,
  	\`content_fields_use_leading_header\` integer,
  	\`content_fields_leading_header\` text,
  	\`content_fields_layout\` text DEFAULT 'oneColumn',
  	\`content_fields_column_one\` text,
  	\`content_fields_column_two\` text,
  	\`content_fields_column_three\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_content_order_idx\` ON \`pages_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_content_parent_id_idx\` ON \`pages_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_content_path_idx\` ON \`pages_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`form_fields_settings_theme\` text,
  	\`form_fields_settings_background\` text,
  	\`form_fields_rich_text\` text,
  	\`form_fields_form_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`form_fields_form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_form_order_idx\` ON \`pages_blocks_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_form_parent_id_idx\` ON \`pages_blocks_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_form_path_idx\` ON \`pages_blocks_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_form_form_fields_form_fields_form_idx\` ON \`pages_blocks_form\` (\`form_fields_form_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_hover_cards_hover_cards_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hover_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_hover_cards_hover_cards_fields_cards_order_idx\` ON \`pages_blocks_hover_cards_hover_cards_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_hover_cards_hover_cards_fields_cards_parent_id_idx\` ON \`pages_blocks_hover_cards_hover_cards_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_hover_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hover_cards_fields_settings_theme\` text,
  	\`hover_cards_fields_settings_background\` text,
  	\`hover_cards_fields_hide_background\` integer,
  	\`hover_cards_fields_rich_text\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_hover_cards_order_idx\` ON \`pages_blocks_hover_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_hover_cards_parent_id_idx\` ON \`pages_blocks_hover_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_hover_cards_path_idx\` ON \`pages_blocks_hover_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_link_grid_link_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_link_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_link_grid_link_grid_fields_links_order_idx\` ON \`pages_blocks_link_grid_link_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_link_grid_link_grid_fields_links_parent_id_idx\` ON \`pages_blocks_link_grid_link_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_link_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_grid_fields_settings_theme\` text,
  	\`link_grid_fields_settings_background\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_link_grid_order_idx\` ON \`pages_blocks_link_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_link_grid_parent_id_idx\` ON \`pages_blocks_link_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_link_grid_path_idx\` ON \`pages_blocks_link_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_logo_grid_logo_grid_fields_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`logo_media_id\` integer,
  	FOREIGN KEY (\`logo_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_logo_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_logo_grid_logo_grid_fields_logos_order_idx\` ON \`pages_blocks_logo_grid_logo_grid_fields_logos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_logo_grid_logo_grid_fields_logos_parent_id_idx\` ON \`pages_blocks_logo_grid_logo_grid_fields_logos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_logo_grid_logo_grid_fields_logos_logo_media_idx\` ON \`pages_blocks_logo_grid_logo_grid_fields_logos\` (\`logo_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_logo_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`logo_grid_fields_settings_theme\` text,
  	\`logo_grid_fields_settings_background\` text,
  	\`logo_grid_fields_rich_text\` text,
  	\`logo_grid_fields_enable_link\` integer,
  	\`logo_grid_fields_link_type\` text DEFAULT 'reference',
  	\`logo_grid_fields_link_new_tab\` integer,
  	\`logo_grid_fields_link_url\` text,
  	\`logo_grid_fields_link_label\` text,
  	\`logo_grid_fields_link_custom_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_logo_grid_order_idx\` ON \`pages_blocks_logo_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_logo_grid_parent_id_idx\` ON \`pages_blocks_logo_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_logo_grid_path_idx\` ON \`pages_blocks_logo_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_reusable_content_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`reusable_content_block_fields_settings_theme\` text,
  	\`reusable_content_block_fields_settings_background\` text,
  	\`reusable_content_block_fields_reusable_content_id\` integer,
  	\`reusable_content_block_fields_custom_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`reusable_content_block_fields_reusable_content_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_reusable_content_block_order_idx\` ON \`pages_blocks_reusable_content_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_reusable_content_block_parent_id_idx\` ON \`pages_blocks_reusable_content_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_reusable_content_block_path_idx\` ON \`pages_blocks_reusable_content_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_reusable_content_block_reusable_content_blo_idx\` ON \`pages_blocks_reusable_content_block\` (\`reusable_content_block_fields_reusable_content_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_slider_slider_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_slider_slider_fields_links_order_idx\` ON \`pages_blocks_slider_slider_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_slider_slider_fields_links_parent_id_idx\` ON \`pages_blocks_slider_slider_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_slider_slider_fields_quote_slides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`author\` text,
  	\`role\` text,
  	\`logo_id\` integer,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_slider_slider_fields_quote_slides_order_idx\` ON \`pages_blocks_slider_slider_fields_quote_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_slider_slider_fields_quote_slides_parent_id_idx\` ON \`pages_blocks_slider_slider_fields_quote_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_slider_slider_fields_quote_slides_logo_idx\` ON \`pages_blocks_slider_slider_fields_quote_slides\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slider_fields_settings_theme\` text,
  	\`slider_fields_settings_background\` text,
  	\`slider_fields_intro_content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_slider_order_idx\` ON \`pages_blocks_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_slider_parent_id_idx\` ON \`pages_blocks_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_slider_path_idx\` ON \`pages_blocks_slider\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_steps_steps_fields_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`media_id\` integer,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_steps_steps_fields_steps_order_idx\` ON \`pages_blocks_steps_steps_fields_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_steps_steps_fields_steps_parent_id_idx\` ON \`pages_blocks_steps_steps_fields_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_steps_steps_fields_steps_media_idx\` ON \`pages_blocks_steps_steps_fields_steps\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`steps_fields_settings_theme\` text,
  	\`steps_fields_settings_background\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_steps_order_idx\` ON \`pages_blocks_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_steps_parent_id_idx\` ON \`pages_blocks_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_steps_path_idx\` ON \`pages_blocks_steps\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_code_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`code\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_code_example_block_order_idx\` ON \`pages_blocks_code_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_code_example_block_parent_id_idx\` ON \`pages_blocks_code_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_code_example_block_path_idx\` ON \`pages_blocks_code_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_media_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_media_example_block_order_idx\` ON \`pages_blocks_media_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_media_example_block_parent_id_idx\` ON \`pages_blocks_media_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_media_example_block_path_idx\` ON \`pages_blocks_media_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_media_example_block_media_idx\` ON \`pages_blocks_media_example_block\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_example_tabs_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`content\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_example_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_example_tabs_tabs_order_idx\` ON \`pages_blocks_example_tabs_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_example_tabs_tabs_parent_id_idx\` ON \`pages_blocks_example_tabs_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_example_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_example_tabs_order_idx\` ON \`pages_blocks_example_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_example_tabs_parent_id_idx\` ON \`pages_blocks_example_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_example_tabs_path_idx\` ON \`pages_blocks_example_tabs\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_breadcrumbs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`doc_id\` integer,
  	\`url\` text,
  	\`label\` text,
  	FOREIGN KEY (\`doc_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_breadcrumbs_order_idx\` ON \`pages_breadcrumbs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_breadcrumbs_parent_id_idx\` ON \`pages_breadcrumbs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_breadcrumbs_locale_idx\` ON \`pages_breadcrumbs\` (\`_locale\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_breadcrumbs_doc_idx\` ON \`pages_breadcrumbs\` (\`doc_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages\` (
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
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_hero_media_idx\` ON \`pages\` (\`hero_media_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_hero_secondary_media_idx\` ON \`pages\` (\`hero_secondary_media_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_hero_feature_video_idx\` ON \`pages\` (\`hero_feature_video_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_hero_hero_form_idx\` ON \`pages\` (\`hero_form_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_parent_idx\` ON \`pages\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_meta_meta_image_idx\` ON \`pages_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`pages_locales_locale_parent_id_unique\` ON \`pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_rels_pages_id_idx\` ON \`pages_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_rels_posts_id_idx\` ON \`pages_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_rels_case_studies_id_idx\` ON \`pages_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`pages_rels_media_id_idx\` ON \`pages_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_version_hero_breadcrumbs_bar_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_breadcrumbs_bar_links_order_idx\` ON \`_pages_v_version_hero_breadcrumbs_bar_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_breadcrumbs_bar_links_parent_id_idx\` ON \`_pages_v_version_hero_breadcrumbs_bar_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_version_hero_livestream_guests\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`link\` text,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_livestream_guests_order_idx\` ON \`_pages_v_version_hero_livestream_guests\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_livestream_guests_parent_id_idx\` ON \`_pages_v_version_hero_livestream_guests\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_livestream_guests_image_idx\` ON \`_pages_v_version_hero_livestream_guests\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_version_hero_primary_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'link',
  	\`npm_cta_label\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_primary_buttons_order_idx\` ON \`_pages_v_version_hero_primary_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_primary_buttons_parent_id_idx\` ON \`_pages_v_version_hero_primary_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_version_hero_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_links_order_idx\` ON \`_pages_v_version_hero_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_links_parent_id_idx\` ON \`_pages_v_version_hero_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_link\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_link_order_idx\` ON \`_pages_v_blocks_link\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_link_parent_id_idx\` ON \`_pages_v_blocks_link\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_link_path_idx\` ON \`_pages_v_blocks_link\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_command\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`command\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_command_order_idx\` ON \`_pages_v_blocks_command\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_command_parent_id_idx\` ON \`_pages_v_blocks_command\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_command_path_idx\` ON \`_pages_v_blocks_command\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_version_hero_secondary_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_secondary_buttons_order_idx\` ON \`_pages_v_version_hero_secondary_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_secondary_buttons_parent_id_idx\` ON \`_pages_v_version_hero_secondary_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_version_hero_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_images_order_idx\` ON \`_pages_v_version_hero_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_images_parent_id_idx\` ON \`_pages_v_version_hero_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_images_image_idx\` ON \`_pages_v_version_hero_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_version_hero_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_media_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_logos_order_idx\` ON \`_pages_v_version_hero_logos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_logos_parent_id_idx\` ON \`_pages_v_version_hero_logos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_logos_logo_media_idx\` ON \`_pages_v_version_hero_logos\` (\`logo_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_cta_cta_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'link',
  	\`npm_cta_label\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_cta_cta_fields_links_order_idx\` ON \`_pages_v_blocks_cta_cta_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_cta_cta_fields_links_parent_id_idx\` ON \`_pages_v_blocks_cta_cta_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cta_fields_settings_theme\` text,
  	\`cta_fields_settings_background\` text,
  	\`cta_fields_style\` text DEFAULT 'buttons',
  	\`cta_fields_rich_text\` text,
  	\`cta_fields_command_line\` text,
  	\`cta_fields_banner_link_type\` text DEFAULT 'reference',
  	\`cta_fields_banner_link_new_tab\` integer,
  	\`cta_fields_banner_link_url\` text,
  	\`cta_fields_banner_link_label\` text,
  	\`cta_fields_banner_link_custom_id\` text,
  	\`cta_fields_banner_image_id\` integer,
  	\`cta_fields_gradient_background\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`cta_fields_banner_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_cta_order_idx\` ON \`_pages_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_cta_parent_id_idx\` ON \`_pages_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_cta_path_idx\` ON \`_pages_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_cta_cta_fields_cta_fields_banner_image_idx\` ON \`_pages_v_blocks_cta\` (\`cta_fields_banner_image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_card_grid_card_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_card_grid_card_grid_fields_links_order_idx\` ON \`_pages_v_blocks_card_grid_card_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_card_grid_card_grid_fields_links_parent_id_idx\` ON \`_pages_v_blocks_card_grid_card_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_card_grid_card_grid_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_card_grid_card_grid_fields_cards_order_idx\` ON \`_pages_v_blocks_card_grid_card_grid_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_card_grid_card_grid_fields_cards_parent_id_idx\` ON \`_pages_v_blocks_card_grid_card_grid_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`card_grid_fields_settings_theme\` text,
  	\`card_grid_fields_settings_background\` text,
  	\`card_grid_fields_rich_text\` text,
  	\`card_grid_fields_reveal_description\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_card_grid_order_idx\` ON \`_pages_v_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_card_grid_parent_id_idx\` ON \`_pages_v_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_card_grid_path_idx\` ON \`_pages_v_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content_fields_settings_theme\` text,
  	\`content_fields_settings_background\` text,
  	\`content_fields_use_leading_header\` integer,
  	\`content_fields_leading_header\` text,
  	\`content_fields_layout\` text DEFAULT 'oneColumn',
  	\`content_fields_column_one\` text,
  	\`content_fields_column_two\` text,
  	\`content_fields_column_three\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_content_order_idx\` ON \`_pages_v_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_content_parent_id_idx\` ON \`_pages_v_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_content_path_idx\` ON \`_pages_v_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_cmp_v_comparison_table_fields_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`feature\` text,
  	\`column_one_check\` integer,
  	\`column_one\` text,
  	\`column_two_check\` integer,
  	\`column_two\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_cmp_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cmp_v_comparison_table_fields_rows_order_idx\` ON \`_cmp_v_comparison_table_fields_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cmp_v_comparison_table_fields_rows_parent_id_idx\` ON \`_cmp_v_comparison_table_fields_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_cmp_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`comparison_table_fields_settings_theme\` text,
  	\`comparison_table_fields_settings_background\` text,
  	\`comparison_table_fields_intro_content\` text,
  	\`comparison_table_fields_style\` text DEFAULT 'default',
  	\`comparison_table_fields_header_table_title\` text,
  	\`comparison_table_fields_header_column_one_header\` text,
  	\`comparison_table_fields_header_column_two_header\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cmp_v_order_idx\` ON \`_cmp_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cmp_v_parent_id_idx\` ON \`_cmp_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_cmp_v_path_idx\` ON \`_cmp_v\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`form_fields_settings_theme\` text,
  	\`form_fields_settings_background\` text,
  	\`form_fields_rich_text\` text,
  	\`form_fields_form_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`form_fields_form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_form_order_idx\` ON \`_pages_v_blocks_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_form_parent_id_idx\` ON \`_pages_v_blocks_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_form_path_idx\` ON \`_pages_v_blocks_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_form_form_fields_form_fields_form_idx\` ON \`_pages_v_blocks_form\` (\`form_fields_form_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_hover_cards_hover_cards_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_hover_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_hover_cards_hover_cards_fields_cards_order_idx\` ON \`_pages_v_blocks_hover_cards_hover_cards_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_hover_cards_hover_cards_fields_cards_parent_id_idx\` ON \`_pages_v_blocks_hover_cards_hover_cards_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_hover_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hover_cards_fields_settings_theme\` text,
  	\`hover_cards_fields_settings_background\` text,
  	\`hover_cards_fields_hide_background\` integer,
  	\`hover_cards_fields_rich_text\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_hover_cards_order_idx\` ON \`_pages_v_blocks_hover_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_hover_cards_parent_id_idx\` ON \`_pages_v_blocks_hover_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_hover_cards_path_idx\` ON \`_pages_v_blocks_hover_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_link_grid_link_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_link_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_link_grid_link_grid_fields_links_order_idx\` ON \`_pages_v_blocks_link_grid_link_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_link_grid_link_grid_fields_links_parent_id_idx\` ON \`_pages_v_blocks_link_grid_link_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_link_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_grid_fields_settings_theme\` text,
  	\`link_grid_fields_settings_background\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_link_grid_order_idx\` ON \`_pages_v_blocks_link_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_link_grid_parent_id_idx\` ON \`_pages_v_blocks_link_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_link_grid_path_idx\` ON \`_pages_v_blocks_link_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_logo_grid_logo_grid_fields_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_media_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_logo_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_logo_grid_logo_grid_fields_logos_order_idx\` ON \`_pages_v_blocks_logo_grid_logo_grid_fields_logos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_logo_grid_logo_grid_fields_logos_parent_id_idx\` ON \`_pages_v_blocks_logo_grid_logo_grid_fields_logos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_logo_grid_logo_grid_fields_logos_logo_me_idx\` ON \`_pages_v_blocks_logo_grid_logo_grid_fields_logos\` (\`logo_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_logo_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_grid_fields_settings_theme\` text,
  	\`logo_grid_fields_settings_background\` text,
  	\`logo_grid_fields_rich_text\` text,
  	\`logo_grid_fields_enable_link\` integer,
  	\`logo_grid_fields_link_type\` text DEFAULT 'reference',
  	\`logo_grid_fields_link_new_tab\` integer,
  	\`logo_grid_fields_link_url\` text,
  	\`logo_grid_fields_link_label\` text,
  	\`logo_grid_fields_link_custom_id\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_logo_grid_order_idx\` ON \`_pages_v_blocks_logo_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_logo_grid_parent_id_idx\` ON \`_pages_v_blocks_logo_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_logo_grid_path_idx\` ON \`_pages_v_blocks_logo_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_reusable_content_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`reusable_content_block_fields_settings_theme\` text,
  	\`reusable_content_block_fields_settings_background\` text,
  	\`reusable_content_block_fields_reusable_content_id\` integer,
  	\`reusable_content_block_fields_custom_id\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`reusable_content_block_fields_reusable_content_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_reusable_content_block_order_idx\` ON \`_pages_v_blocks_reusable_content_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_reusable_content_block_parent_id_idx\` ON \`_pages_v_blocks_reusable_content_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_reusable_content_block_path_idx\` ON \`_pages_v_blocks_reusable_content_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_reusable_content_block_reusable_content__idx\` ON \`_pages_v_blocks_reusable_content_block\` (\`reusable_content_block_fields_reusable_content_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_slider_slider_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_slider_slider_fields_links_order_idx\` ON \`_pages_v_blocks_slider_slider_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_slider_slider_fields_links_parent_id_idx\` ON \`_pages_v_blocks_slider_slider_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_slider_slider_fields_quote_slides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`author\` text,
  	\`role\` text,
  	\`logo_id\` integer,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_slider_slider_fields_quote_slides_order_idx\` ON \`_pages_v_blocks_slider_slider_fields_quote_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_slider_slider_fields_quote_slides_parent_id_idx\` ON \`_pages_v_blocks_slider_slider_fields_quote_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_slider_slider_fields_quote_slides_logo_idx\` ON \`_pages_v_blocks_slider_slider_fields_quote_slides\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slider_fields_settings_theme\` text,
  	\`slider_fields_settings_background\` text,
  	\`slider_fields_intro_content\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_slider_order_idx\` ON \`_pages_v_blocks_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_slider_parent_id_idx\` ON \`_pages_v_blocks_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_slider_path_idx\` ON \`_pages_v_blocks_slider\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_steps_steps_fields_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_steps_steps_fields_steps_order_idx\` ON \`_pages_v_blocks_steps_steps_fields_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_steps_steps_fields_steps_parent_id_idx\` ON \`_pages_v_blocks_steps_steps_fields_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_steps_steps_fields_steps_media_idx\` ON \`_pages_v_blocks_steps_steps_fields_steps\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`steps_fields_settings_theme\` text,
  	\`steps_fields_settings_background\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_steps_order_idx\` ON \`_pages_v_blocks_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_steps_parent_id_idx\` ON \`_pages_v_blocks_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_steps_path_idx\` ON \`_pages_v_blocks_steps\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_code_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`code\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_code_example_block_order_idx\` ON \`_pages_v_blocks_code_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_code_example_block_parent_id_idx\` ON \`_pages_v_blocks_code_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_code_example_block_path_idx\` ON \`_pages_v_blocks_code_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_media_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_media_example_block_order_idx\` ON \`_pages_v_blocks_media_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_media_example_block_parent_id_idx\` ON \`_pages_v_blocks_media_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_media_example_block_path_idx\` ON \`_pages_v_blocks_media_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_media_example_block_media_idx\` ON \`_pages_v_blocks_media_example_block\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_example_tabs_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`content\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_example_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_example_tabs_tabs_order_idx\` ON \`_pages_v_blocks_example_tabs_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_example_tabs_tabs_parent_id_idx\` ON \`_pages_v_blocks_example_tabs_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_example_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_example_tabs_order_idx\` ON \`_pages_v_blocks_example_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_example_tabs_parent_id_idx\` ON \`_pages_v_blocks_example_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_example_tabs_path_idx\` ON \`_pages_v_blocks_example_tabs\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_version_breadcrumbs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`doc_id\` integer,
  	\`url\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`doc_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_breadcrumbs_order_idx\` ON \`_pages_v_version_breadcrumbs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_breadcrumbs_parent_id_idx\` ON \`_pages_v_version_breadcrumbs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_breadcrumbs_locale_idx\` ON \`_pages_v_version_breadcrumbs\` (\`_locale\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_breadcrumbs_doc_idx\` ON \`_pages_v_version_breadcrumbs\` (\`doc_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v\` (
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
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_version_hero_media_idx\` ON \`_pages_v\` (\`version_hero_media_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_version_hero_secondary_media_idx\` ON \`_pages_v\` (\`version_hero_secondary_media_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_version_hero_feature_video_idx\` ON \`_pages_v\` (\`version_hero_feature_video_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_hero_version_hero_form_idx\` ON \`_pages_v\` (\`version_hero_form_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_version_parent_idx\` ON \`_pages_v\` (\`version_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_snapshot_idx\` ON \`_pages_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_published_locale_idx\` ON \`_pages_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_locales\` (
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_version_meta_version_meta_image_idx\` ON \`_pages_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_pages_v_locales_locale_parent_id_unique\` ON \`_pages_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_rels_pages_id_idx\` ON \`_pages_v_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_rels_posts_id_idx\` ON \`_pages_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_rels_case_studies_id_idx\` ON \`_pages_v_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_pages_v_rels_media_id_idx\` ON \`_pages_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_checkbox\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`width\` numeric,
  	\`required\` integer,
  	\`default_value\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_checkbox_order_idx\` ON \`forms_blocks_checkbox\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_checkbox_parent_id_idx\` ON \`forms_blocks_checkbox\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_checkbox_path_idx\` ON \`forms_blocks_checkbox\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_checkbox_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_checkbox\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_blocks_checkbox_locales_locale_parent_id_unique\` ON \`forms_blocks_checkbox_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_country\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`width\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_country_order_idx\` ON \`forms_blocks_country\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_country_parent_id_idx\` ON \`forms_blocks_country\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_country_path_idx\` ON \`forms_blocks_country\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_country_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_country\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_blocks_country_locales_locale_parent_id_unique\` ON \`forms_blocks_country_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_email\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`width\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_email_order_idx\` ON \`forms_blocks_email\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_email_parent_id_idx\` ON \`forms_blocks_email\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_email_path_idx\` ON \`forms_blocks_email\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_email_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_email\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_blocks_email_locales_locale_parent_id_unique\` ON \`forms_blocks_email_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_message\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_message_order_idx\` ON \`forms_blocks_message\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_message_parent_id_idx\` ON \`forms_blocks_message\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_message_path_idx\` ON \`forms_blocks_message\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_message_locales\` (
  	\`message\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_message\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_blocks_message_locales_locale_parent_id_unique\` ON \`forms_blocks_message_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_number\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`width\` numeric,
  	\`default_value\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_number_order_idx\` ON \`forms_blocks_number\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_number_parent_id_idx\` ON \`forms_blocks_number\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_number_path_idx\` ON \`forms_blocks_number\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_number_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_number\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_blocks_number_locales_locale_parent_id_unique\` ON \`forms_blocks_number_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_select_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_select\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_select_options_order_idx\` ON \`forms_blocks_select_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_select_options_parent_id_idx\` ON \`forms_blocks_select_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_select_options_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_select_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_blocks_select_options_locales_locale_parent_id_unique\` ON \`forms_blocks_select_options_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_select\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`width\` numeric,
  	\`placeholder\` text,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_select_order_idx\` ON \`forms_blocks_select\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_select_parent_id_idx\` ON \`forms_blocks_select\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_select_path_idx\` ON \`forms_blocks_select\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_select_locales\` (
  	\`label\` text,
  	\`default_value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_select\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_blocks_select_locales_locale_parent_id_unique\` ON \`forms_blocks_select_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_state\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`width\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_state_order_idx\` ON \`forms_blocks_state\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_state_parent_id_idx\` ON \`forms_blocks_state\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_state_path_idx\` ON \`forms_blocks_state\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_state_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_state\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_blocks_state_locales_locale_parent_id_unique\` ON \`forms_blocks_state_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`width\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_text_order_idx\` ON \`forms_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_text_parent_id_idx\` ON \`forms_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_text_path_idx\` ON \`forms_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_text_locales\` (
  	\`label\` text,
  	\`default_value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_blocks_text_locales_locale_parent_id_unique\` ON \`forms_blocks_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_textarea\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`width\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_textarea_order_idx\` ON \`forms_blocks_textarea\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_textarea_parent_id_idx\` ON \`forms_blocks_textarea\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_blocks_textarea_path_idx\` ON \`forms_blocks_textarea\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_blocks_textarea_locales\` (
  	\`label\` text,
  	\`default_value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_textarea\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_blocks_textarea_locales_locale_parent_id_unique\` ON \`forms_blocks_textarea_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_emails\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`email_to\` text,
  	\`cc\` text,
  	\`bcc\` text,
  	\`reply_to\` text,
  	\`email_from\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_emails_order_idx\` ON \`forms_emails\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_emails_parent_id_idx\` ON \`forms_emails\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_emails_locales\` (
  	\`subject\` text DEFAULT 'You''ve received a new message.' NOT NULL,
  	\`message\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_emails\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_emails_locales_locale_parent_id_unique\` ON \`forms_emails_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`confirmation_type\` text DEFAULT 'message',
  	\`redirect_url\` text,
  	\`hub_spot_form_id\` text,
  	\`custom_id\` text,
  	\`require_recaptcha\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_updated_at_idx\` ON \`forms\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`forms_created_at_idx\` ON \`forms\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`forms_locales\` (
  	\`submit_button_label\` text,
  	\`confirmation_message\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`forms_locales_locale_parent_id_unique\` ON \`forms_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`form_submissions_submission_data\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`field\` text NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`form_submissions_submission_data_order_idx\` ON \`form_submissions_submission_data\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`form_submissions_submission_data_parent_id_idx\` ON \`form_submissions_submission_data\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`form_submissions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`form_id\` integer NOT NULL,
  	\`recaptcha\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`form_submissions_form_idx\` ON \`form_submissions\` (\`form_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`form_submissions_updated_at_idx\` ON \`form_submissions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`form_submissions_created_at_idx\` ON \`form_submissions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`redirects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`from\` text NOT NULL,
  	\`to_type\` text DEFAULT 'reference',
  	\`to_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`redirects_from_idx\` ON \`redirects\` (\`from\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`redirects_updated_at_idx\` ON \`redirects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`redirects_created_at_idx\` ON \`redirects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`redirects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`case_studies_id\` integer,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`redirects_rels_order_idx\` ON \`redirects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`redirects_rels_parent_idx\` ON \`redirects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`redirects_rels_path_idx\` ON \`redirects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`redirects_rels_case_studies_id_idx\` ON \`redirects_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`redirects_rels_pages_id_idx\` ON \`redirects_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`redirects_rels_posts_id_idx\` ON \`redirects_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_locked_documents_rels\` (
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
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_reusable_content_id_idx\` ON \`payload_locked_documents_rels\` (\`reusable_content_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_case_studies_id_idx\` ON \`payload_locked_documents_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_community_help_id_idx\` ON \`payload_locked_documents_rels\` (\`community_help_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_docs_id_idx\` ON \`payload_locked_documents_rels\` (\`docs_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_partners_id_idx\` ON \`payload_locked_documents_rels\` (\`partners_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_industries_id_idx\` ON \`payload_locked_documents_rels\` (\`industries_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_specialties_id_idx\` ON \`payload_locked_documents_rels\` (\`specialties_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_regions_id_idx\` ON \`payload_locked_documents_rels\` (\`regions_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_budgets_id_idx\` ON \`payload_locked_documents_rels\` (\`budgets_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_forms_id_idx\` ON \`payload_locked_documents_rels\` (\`forms_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_form_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`form_submissions_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`admin_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`show_dashboard_notice\` integer DEFAULT false,
  	\`dashboard_notice\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`footer_columns_nav_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_columns_nav_items_order_idx\` ON \`footer_columns_nav_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_columns_nav_items_parent_id_idx\` ON \`footer_columns_nav_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_columns_order_idx\` ON \`footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_columns_parent_id_idx\` ON \`footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`footer\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`footer_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_rels_order_idx\` ON \`footer_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_rels_parent_idx\` ON \`footer_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_rels_path_idx\` ON \`footer_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_rels_pages_id_idx\` ON \`footer_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_rels_posts_id_idx\` ON \`footer_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_rels_case_studies_id_idx\` ON \`footer_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`main_menu_tabs_description_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`main_menu_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_tabs_description_links_order_idx\` ON \`main_menu_tabs_description_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_tabs_description_links_parent_id_idx\` ON \`main_menu_tabs_description_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`main_menu_tabs_nav_items_featured_link_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`main_menu_tabs_nav_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_tabs_nav_items_featured_link_links_order_idx\` ON \`main_menu_tabs_nav_items_featured_link_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_tabs_nav_items_featured_link_links_parent_id_idx\` ON \`main_menu_tabs_nav_items_featured_link_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`main_menu_tabs_nav_items_list_links_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`main_menu_tabs_nav_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_tabs_nav_items_list_links_links_order_idx\` ON \`main_menu_tabs_nav_items_list_links_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_tabs_nav_items_list_links_links_parent_id_idx\` ON \`main_menu_tabs_nav_items_list_links_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`main_menu_tabs_nav_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`style\` text DEFAULT 'default',
  	\`default_link_link_type\` text DEFAULT 'reference',
  	\`default_link_link_new_tab\` integer,
  	\`default_link_link_url\` text,
  	\`default_link_link_label\` text,
  	\`default_link_link_custom_id\` text,
  	\`default_link_description\` text,
  	\`featured_link_tag\` text,
  	\`featured_link_label\` text,
  	\`list_links_tag\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`main_menu_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_tabs_nav_items_order_idx\` ON \`main_menu_tabs_nav_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_tabs_nav_items_parent_id_idx\` ON \`main_menu_tabs_nav_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`main_menu_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`enable_direct_link\` integer,
  	\`enable_dropdown\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`main_menu\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_tabs_order_idx\` ON \`main_menu_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_tabs_parent_id_idx\` ON \`main_menu_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`main_menu\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`menu_cta_type\` text DEFAULT 'reference',
  	\`menu_cta_new_tab\` integer,
  	\`menu_cta_url\` text,
  	\`menu_cta_label\` text NOT NULL,
  	\`menu_cta_custom_id\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`main_menu_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`main_menu\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_rels_order_idx\` ON \`main_menu_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_rels_parent_idx\` ON \`main_menu_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_rels_path_idx\` ON \`main_menu_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_rels_pages_id_idx\` ON \`main_menu_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_rels_posts_id_idx\` ON \`main_menu_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`main_menu_rels_case_studies_id_idx\` ON \`main_menu_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`top_bar\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enable_top_bar\` integer,
  	\`message\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`top_bar_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`top_bar\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`top_bar_rels_order_idx\` ON \`top_bar_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`top_bar_rels_parent_idx\` ON \`top_bar_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`top_bar_rels_path_idx\` ON \`top_bar_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`top_bar_rels_pages_id_idx\` ON \`top_bar_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`top_bar_rels_posts_id_idx\` ON \`top_bar_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`top_bar_rels_case_studies_id_idx\` ON \`top_bar_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`get_started_blocks_rich_text_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`content\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`get_started\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_blocks_rich_text_block_order_idx\` ON \`get_started_blocks_rich_text_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_blocks_rich_text_block_parent_id_idx\` ON \`get_started_blocks_rich_text_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_blocks_rich_text_block_path_idx\` ON \`get_started_blocks_rich_text_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`get_started_sidebar_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`get_started\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_sidebar_links_order_idx\` ON \`get_started_sidebar_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_sidebar_links_parent_id_idx\` ON \`get_started_sidebar_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`get_started\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'Get started with Payload',
  	\`sidebar\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`get_started_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`get_started\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_meta_meta_image_idx\` ON \`get_started_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`get_started_locales_locale_parent_id_unique\` ON \`get_started_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`get_started_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`get_started\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_rels_order_idx\` ON \`get_started_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_rels_parent_idx\` ON \`get_started_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_rels_path_idx\` ON \`get_started_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_rels_pages_id_idx\` ON \`get_started_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_rels_posts_id_idx\` ON \`get_started_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`get_started_rels_case_studies_id_idx\` ON \`get_started_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_hero_breadcrumb_bar_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_hero_breadcrumb_bar_links_order_idx\` ON \`partner_program_hero_breadcrumb_bar_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_hero_breadcrumb_bar_links_parent_id_idx\` ON \`partner_program_hero_breadcrumb_bar_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_hero_hero_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_hero_hero_links_order_idx\` ON \`partner_program_hero_hero_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_hero_hero_links_parent_id_idx\` ON \`partner_program_hero_hero_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_cta_cta_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'link',
  	\`npm_cta_label\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_cta_cta_fields_links_order_idx\` ON \`partner_program_blocks_cta_cta_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_cta_cta_fields_links_parent_id_idx\` ON \`partner_program_blocks_cta_cta_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`cta_fields_settings_theme\` text,
  	\`cta_fields_settings_background\` text,
  	\`cta_fields_style\` text DEFAULT 'buttons',
  	\`cta_fields_rich_text\` text NOT NULL,
  	\`cta_fields_command_line\` text,
  	\`cta_fields_banner_link_type\` text DEFAULT 'reference',
  	\`cta_fields_banner_link_new_tab\` integer,
  	\`cta_fields_banner_link_url\` text,
  	\`cta_fields_banner_link_label\` text,
  	\`cta_fields_banner_link_custom_id\` text,
  	\`cta_fields_banner_image_id\` integer,
  	\`cta_fields_gradient_background\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`cta_fields_banner_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_cta_order_idx\` ON \`partner_program_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_cta_parent_id_idx\` ON \`partner_program_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_cta_path_idx\` ON \`partner_program_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_cta_cta_fields_cta_fields_banner__idx\` ON \`partner_program_blocks_cta\` (\`cta_fields_banner_image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_card_grid_card_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_card_grid_card_grid_fields_links_order_idx\` ON \`partner_program_blocks_card_grid_card_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_card_grid_card_grid_fields_links_parent_id_idx\` ON \`partner_program_blocks_card_grid_card_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_card_grid_card_grid_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_card_grid_card_grid_fields_cards_order_idx\` ON \`partner_program_blocks_card_grid_card_grid_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_card_grid_card_grid_fields_cards_parent_id_idx\` ON \`partner_program_blocks_card_grid_card_grid_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`card_grid_fields_settings_theme\` text,
  	\`card_grid_fields_settings_background\` text,
  	\`card_grid_fields_rich_text\` text NOT NULL,
  	\`card_grid_fields_reveal_description\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_card_grid_order_idx\` ON \`partner_program_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_card_grid_parent_id_idx\` ON \`partner_program_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_card_grid_path_idx\` ON \`partner_program_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content_fields_settings_theme\` text,
  	\`content_fields_settings_background\` text,
  	\`content_fields_use_leading_header\` integer,
  	\`content_fields_leading_header\` text,
  	\`content_fields_layout\` text DEFAULT 'oneColumn',
  	\`content_fields_column_one\` text NOT NULL,
  	\`content_fields_column_two\` text,
  	\`content_fields_column_three\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_content_order_idx\` ON \`partner_program_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_content_parent_id_idx\` ON \`partner_program_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_content_path_idx\` ON \`partner_program_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`form_fields_settings_theme\` text,
  	\`form_fields_settings_background\` text,
  	\`form_fields_rich_text\` text NOT NULL,
  	\`form_fields_form_id\` integer NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`form_fields_form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_form_order_idx\` ON \`partner_program_blocks_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_form_parent_id_idx\` ON \`partner_program_blocks_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_form_path_idx\` ON \`partner_program_blocks_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_form_form_fields_form_fields_form_idx\` ON \`partner_program_blocks_form\` (\`form_fields_form_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_hover_cards_hover_cards_fields_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program_blocks_hover_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_hover_cards_hover_cards_fields_cards_order_idx\` ON \`partner_program_blocks_hover_cards_hover_cards_fields_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_hover_cards_hover_cards_fields_cards_parent_id_idx\` ON \`partner_program_blocks_hover_cards_hover_cards_fields_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_hover_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hover_cards_fields_settings_theme\` text,
  	\`hover_cards_fields_settings_background\` text,
  	\`hover_cards_fields_hide_background\` integer,
  	\`hover_cards_fields_rich_text\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_hover_cards_order_idx\` ON \`partner_program_blocks_hover_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_hover_cards_parent_id_idx\` ON \`partner_program_blocks_hover_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_hover_cards_path_idx\` ON \`partner_program_blocks_hover_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_link_grid_link_grid_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program_blocks_link_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_link_grid_link_grid_fields_links_order_idx\` ON \`partner_program_blocks_link_grid_link_grid_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_link_grid_link_grid_fields_links_parent_id_idx\` ON \`partner_program_blocks_link_grid_link_grid_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_link_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_grid_fields_settings_theme\` text,
  	\`link_grid_fields_settings_background\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_link_grid_order_idx\` ON \`partner_program_blocks_link_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_link_grid_parent_id_idx\` ON \`partner_program_blocks_link_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_link_grid_path_idx\` ON \`partner_program_blocks_link_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_logo_grid_logo_grid_fields_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`logo_media_id\` integer NOT NULL,
  	FOREIGN KEY (\`logo_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program_blocks_logo_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_logo_grid_logo_grid_fields_logos_order_idx\` ON \`partner_program_blocks_logo_grid_logo_grid_fields_logos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_logo_grid_logo_grid_fields_logos_parent_id_idx\` ON \`partner_program_blocks_logo_grid_logo_grid_fields_logos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_logo_grid_logo_grid_fields_logos__idx\` ON \`partner_program_blocks_logo_grid_logo_grid_fields_logos\` (\`logo_media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_logo_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`logo_grid_fields_settings_theme\` text,
  	\`logo_grid_fields_settings_background\` text,
  	\`logo_grid_fields_rich_text\` text NOT NULL,
  	\`logo_grid_fields_enable_link\` integer,
  	\`logo_grid_fields_link_type\` text DEFAULT 'reference',
  	\`logo_grid_fields_link_new_tab\` integer,
  	\`logo_grid_fields_link_url\` text,
  	\`logo_grid_fields_link_label\` text,
  	\`logo_grid_fields_link_custom_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_logo_grid_order_idx\` ON \`partner_program_blocks_logo_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_logo_grid_parent_id_idx\` ON \`partner_program_blocks_logo_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_logo_grid_path_idx\` ON \`partner_program_blocks_logo_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_reusable_content_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`reusable_content_block_fields_settings_theme\` text,
  	\`reusable_content_block_fields_settings_background\` text,
  	\`reusable_content_block_fields_reusable_content_id\` integer NOT NULL,
  	\`reusable_content_block_fields_custom_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`reusable_content_block_fields_reusable_content_id\`) REFERENCES \`reusable_content\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_reusable_content_block_order_idx\` ON \`partner_program_blocks_reusable_content_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_reusable_content_block_parent_id_idx\` ON \`partner_program_blocks_reusable_content_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_reusable_content_block_path_idx\` ON \`partner_program_blocks_reusable_content_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_reusable_content_block_reusable_c_idx\` ON \`partner_program_blocks_reusable_content_block\` (\`reusable_content_block_fields_reusable_content_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_slider_slider_fields_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`link_custom_id\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_slider_slider_fields_links_order_idx\` ON \`partner_program_blocks_slider_slider_fields_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_slider_slider_fields_links_parent_id_idx\` ON \`partner_program_blocks_slider_slider_fields_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_slider_slider_fields_quote_slides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`quote\` text NOT NULL,
  	\`author\` text NOT NULL,
  	\`role\` text,
  	\`logo_id\` integer,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_custom_id\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program_blocks_slider\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_slider_slider_fields_quote_slides_order_idx\` ON \`partner_program_blocks_slider_slider_fields_quote_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_slider_slider_fields_quote_slides_parent_id_idx\` ON \`partner_program_blocks_slider_slider_fields_quote_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_slider_slider_fields_quote_slides_idx\` ON \`partner_program_blocks_slider_slider_fields_quote_slides\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_slider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slider_fields_settings_theme\` text,
  	\`slider_fields_settings_background\` text,
  	\`slider_fields_intro_content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_slider_order_idx\` ON \`partner_program_blocks_slider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_slider_parent_id_idx\` ON \`partner_program_blocks_slider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_slider_path_idx\` ON \`partner_program_blocks_slider\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_steps_steps_fields_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program_blocks_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_steps_steps_fields_steps_order_idx\` ON \`partner_program_blocks_steps_steps_fields_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_steps_steps_fields_steps_parent_id_idx\` ON \`partner_program_blocks_steps_steps_fields_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_steps_steps_fields_steps_media_idx\` ON \`partner_program_blocks_steps_steps_fields_steps\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`steps_fields_settings_theme\` text,
  	\`steps_fields_settings_background\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_steps_order_idx\` ON \`partner_program_blocks_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_steps_parent_id_idx\` ON \`partner_program_blocks_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_steps_path_idx\` ON \`partner_program_blocks_steps\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_code_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`code\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_code_example_block_order_idx\` ON \`partner_program_blocks_code_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_code_example_block_parent_id_idx\` ON \`partner_program_blocks_code_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_code_example_block_path_idx\` ON \`partner_program_blocks_code_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_media_example_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_media_example_block_order_idx\` ON \`partner_program_blocks_media_example_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_media_example_block_parent_id_idx\` ON \`partner_program_blocks_media_example_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_media_example_block_path_idx\` ON \`partner_program_blocks_media_example_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_media_example_block_media_idx\` ON \`partner_program_blocks_media_example_block\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_example_tabs_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`content\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program_blocks_example_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_example_tabs_tabs_order_idx\` ON \`partner_program_blocks_example_tabs_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_example_tabs_tabs_parent_id_idx\` ON \`partner_program_blocks_example_tabs_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_blocks_example_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_example_tabs_order_idx\` ON \`partner_program_blocks_example_tabs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_example_tabs_parent_id_idx\` ON \`partner_program_blocks_example_tabs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_blocks_example_tabs_path_idx\` ON \`partner_program_blocks_example_tabs\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`contact_form_id\` integer NOT NULL,
  	\`hero_rich_text\` text,
  	\`featured_partners_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`contact_form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_contact_form_idx\` ON \`partner_program\` (\`contact_form_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`partner_program_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`case_studies_id\` integer,
  	\`partners_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`partner_program\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`partners_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_rels_order_idx\` ON \`partner_program_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_rels_parent_idx\` ON \`partner_program_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_rels_path_idx\` ON \`partner_program_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_rels_pages_id_idx\` ON \`partner_program_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_rels_posts_id_idx\` ON \`partner_program_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_rels_case_studies_id_idx\` ON \`partner_program_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`partner_program_rels_partners_id_idx\` ON \`partner_program_rels\` (\`partners_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_roles\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_banner\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_blog_content\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_blog_markdown\`;`)
  await db.run(sql`DROP TABLE \`co_callout_fields_images\`;`)
  await db.run(sql`DROP TABLE \`co\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_cta_cta_fields_links\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_card_grid_card_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_card_grid_card_grid_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`csc_case_study_card_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`csc\`;`)
  await db.run(sql`DROP TABLE \`csh\`;`)
  await db.run(sql`DROP TABLE \`csp_case_study_parallax_fields_items_images\`;`)
  await db.run(sql`DROP TABLE \`csp_case_study_parallax_fields_items\`;`)
  await db.run(sql`DROP TABLE \`csp\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_code_code_fields_code_blips\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_code\`;`)
  await db.run(sql`DROP TABLE \`cdf_code_feature_fields_links\`;`)
  await db.run(sql`DROP TABLE \`cdf_code_feature_fields_code_tabs_code_blips\`;`)
  await db.run(sql`DROP TABLE \`cdf_code_feature_fields_code_tabs\`;`)
  await db.run(sql`DROP TABLE \`cdf\`;`)
  await db.run(sql`DROP TABLE \`cmp_comparison_table_fields_rows\`;`)
  await db.run(sql`DROP TABLE \`cmp\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`cgr_content_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`cgr_content_grid_fields_cells\`;`)
  await db.run(sql`DROP TABLE \`cgr\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_code_example_block\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_media_example_block\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_example_tabs_tabs\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_example_tabs\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_form\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_hover_cards_hover_cards_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_hover_cards\`;`)
  await db.run(sql`DROP TABLE \`hhl_highlight_rows\`;`)
  await db.run(sql`DROP TABLE \`hhl\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_link_grid_link_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_link_grid\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_logo_grid_logo_grid_fields_logos\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_logo_grid\`;`)
  await db.run(sql`DROP TABLE \`mb\`;`)
  await db.run(sql`DROP TABLE \`mcnt_media_content_fields_images\`;`)
  await db.run(sql`DROP TABLE \`mcnt\`;`)
  await db.run(sql`DROP TABLE \`mca_media_content_accordion_fields_accordion\`;`)
  await db.run(sql`DROP TABLE \`mca\`;`)
  await db.run(sql`DROP TABLE \`feats\`;`)
  await db.run(sql`DROP TABLE \`tiers\`;`)
  await db.run(sql`DROP TABLE \`prc\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_slider_slider_fields_links\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_slider_slider_fields_quote_slides\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_slider\`;`)
  await db.run(sql`DROP TABLE \`stm_statement_fields_links\`;`)
  await db.run(sql`DROP TABLE \`stm\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_steps_steps_fields_steps\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_blocks_steps\`;`)
  await db.run(sql`DROP TABLE \`rows_code_blips\`;`)
  await db.run(sql`DROP TABLE \`rows\`;`)
  await db.run(sql`DROP TABLE \`shl\`;`)
  await db.run(sql`DROP TABLE \`reusable_content\`;`)
  await db.run(sql`DROP TABLE \`reusable_content_rels\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_cta_cta_fields_links\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_card_grid_card_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_card_grid_card_grid_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_form\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_hover_cards_hover_cards_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_hover_cards\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_link_grid_link_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_link_grid\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_logo_grid_logo_grid_fields_logos\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_logo_grid\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_reusable_content_block\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_slider_slider_fields_links\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_slider_slider_fields_quote_slides\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_slider\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_steps_steps_fields_steps\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_steps\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_code_example_block\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_media_example_block\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_example_tabs_tabs\`;`)
  await db.run(sql`DROP TABLE \`case_studies_blocks_example_tabs\`;`)
  await db.run(sql`DROP TABLE \`case_studies\`;`)
  await db.run(sql`DROP TABLE \`case_studies_locales\`;`)
  await db.run(sql`DROP TABLE \`case_studies_rels\`;`)
  await db.run(sql`DROP TABLE \`_co_v_callout_fields_images\`;`)
  await db.run(sql`DROP TABLE \`_co_v\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_cta_cta_fields_links\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_card_grid_card_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_card_grid_card_grid_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`_csc_v_case_study_card_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`_csc_v\`;`)
  await db.run(sql`DROP TABLE \`_csh_v\`;`)
  await db.run(sql`DROP TABLE \`_csp_v_case_study_parallax_fields_items_images\`;`)
  await db.run(sql`DROP TABLE \`_csp_v_case_study_parallax_fields_items\`;`)
  await db.run(sql`DROP TABLE \`_csp_v\`;`)
  await db.run(sql`DROP TABLE \`_cdf_v_code_feature_fields_links\`;`)
  await db.run(sql`DROP TABLE \`_cdf_v_code_feature_fields_code_tabs_code_blips\`;`)
  await db.run(sql`DROP TABLE \`_cdf_v_code_feature_fields_code_tabs\`;`)
  await db.run(sql`DROP TABLE \`_cdf_v\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`_cgr_v_content_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`_cgr_v_content_grid_fields_cells\`;`)
  await db.run(sql`DROP TABLE \`_cgr_v\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_form\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_hover_cards_hover_cards_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_hover_cards\`;`)
  await db.run(sql`DROP TABLE \`_hhl_highlight_rows_v\`;`)
  await db.run(sql`DROP TABLE \`_hhl_v\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_link_grid_link_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_link_grid\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_logo_grid_logo_grid_fields_logos\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_logo_grid\`;`)
  await db.run(sql`DROP TABLE \`_mb_v\`;`)
  await db.run(sql`DROP TABLE \`_mcnt_v_media_content_fields_images\`;`)
  await db.run(sql`DROP TABLE \`_mcnt_v\`;`)
  await db.run(sql`DROP TABLE \`_mca_v_media_content_accordion_fields_accordion\`;`)
  await db.run(sql`DROP TABLE \`_mca_v\`;`)
  await db.run(sql`DROP TABLE \`_feats_v\`;`)
  await db.run(sql`DROP TABLE \`_tiers_v\`;`)
  await db.run(sql`DROP TABLE \`_prc_v\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_reusable_content_block\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_slider_slider_fields_links\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_slider_slider_fields_quote_slides\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_slider\`;`)
  await db.run(sql`DROP TABLE \`_stm_v_statement_fields_links\`;`)
  await db.run(sql`DROP TABLE \`_stm_v\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_steps_steps_fields_steps\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_steps\`;`)
  await db.run(sql`DROP TABLE \`_rows_v_code_blips\`;`)
  await db.run(sql`DROP TABLE \`_rows_v\`;`)
  await db.run(sql`DROP TABLE \`_shl_v\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_code_example_block\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_media_example_block\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_example_tabs_tabs\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_blocks_example_tabs\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_rels\`;`)
  await db.run(sql`DROP TABLE \`community_help\`;`)
  await db.run(sql`DROP TABLE \`community_help_rels\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_banner\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_blog_content\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_code_code_fields_code_blips\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_code\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_blog_markdown\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_reusable_content_block\`;`)
  await db.run(sql`DROP TABLE \`posts\`;`)
  await db.run(sql`DROP TABLE \`posts_locales\`;`)
  await db.run(sql`DROP TABLE \`posts_texts\`;`)
  await db.run(sql`DROP TABLE \`posts_rels\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_banner\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_blog_content\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_code_code_fields_code_blips\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_code\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_blog_markdown\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_reusable_content_block\`;`)
  await db.run(sql`DROP TABLE \`_posts_v\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_texts\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_rels\`;`)
  await db.run(sql`DROP TABLE \`categories\`;`)
  await db.run(sql`DROP TABLE \`docs\`;`)
  await db.run(sql`DROP TABLE \`partners_content_contributions\`;`)
  await db.run(sql`DROP TABLE \`partners_content_projects\`;`)
  await db.run(sql`DROP TABLE \`partners_social\`;`)
  await db.run(sql`DROP TABLE \`partners\`;`)
  await db.run(sql`DROP TABLE \`partners_rels\`;`)
  await db.run(sql`DROP TABLE \`_partners_v_version_content_contributions\`;`)
  await db.run(sql`DROP TABLE \`_partners_v_version_content_projects\`;`)
  await db.run(sql`DROP TABLE \`_partners_v_version_social\`;`)
  await db.run(sql`DROP TABLE \`_partners_v\`;`)
  await db.run(sql`DROP TABLE \`_partners_v_rels\`;`)
  await db.run(sql`DROP TABLE \`industries\`;`)
  await db.run(sql`DROP TABLE \`specialties\`;`)
  await db.run(sql`DROP TABLE \`regions\`;`)
  await db.run(sql`DROP TABLE \`budgets\`;`)
  await db.run(sql`DROP TABLE \`pages_hero_breadcrumbs_bar_links\`;`)
  await db.run(sql`DROP TABLE \`pages_hero_livestream_guests\`;`)
  await db.run(sql`DROP TABLE \`pages_hero_primary_buttons\`;`)
  await db.run(sql`DROP TABLE \`pages_hero_links\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_link\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_command\`;`)
  await db.run(sql`DROP TABLE \`pages_hero_secondary_buttons\`;`)
  await db.run(sql`DROP TABLE \`pages_hero_images\`;`)
  await db.run(sql`DROP TABLE \`pages_hero_logos\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_cta_fields_links\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_card_grid_card_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_card_grid_card_grid_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_form\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hover_cards_hover_cards_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hover_cards\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_link_grid_link_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_link_grid\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_logo_grid_logo_grid_fields_logos\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_logo_grid\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_reusable_content_block\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_slider_slider_fields_links\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_slider_slider_fields_quote_slides\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_slider\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_steps_steps_fields_steps\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_steps\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_code_example_block\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_media_example_block\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_example_tabs_tabs\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_example_tabs\`;`)
  await db.run(sql`DROP TABLE \`pages_breadcrumbs\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_hero_breadcrumbs_bar_links\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_hero_livestream_guests\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_hero_primary_buttons\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_hero_links\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_link\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_command\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_hero_secondary_buttons\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_hero_images\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_hero_logos\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta_cta_fields_links\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_card_grid_card_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_card_grid_card_grid_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`_cmp_v_comparison_table_fields_rows\`;`)
  await db.run(sql`DROP TABLE \`_cmp_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_form\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hover_cards_hover_cards_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hover_cards\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_link_grid_link_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_link_grid\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_logo_grid_logo_grid_fields_logos\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_logo_grid\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_reusable_content_block\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_slider_slider_fields_links\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_slider_slider_fields_quote_slides\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_slider\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_steps_steps_fields_steps\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_steps\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_code_example_block\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_media_example_block\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_example_tabs_tabs\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_example_tabs\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_breadcrumbs\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_checkbox\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_checkbox_locales\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_country\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_country_locales\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_email\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_email_locales\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_message\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_message_locales\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_number\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_number_locales\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_select_options\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_select_options_locales\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_select\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_select_locales\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_state\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_state_locales\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_text_locales\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_textarea\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_textarea_locales\`;`)
  await db.run(sql`DROP TABLE \`forms_emails\`;`)
  await db.run(sql`DROP TABLE \`forms_emails_locales\`;`)
  await db.run(sql`DROP TABLE \`forms\`;`)
  await db.run(sql`DROP TABLE \`forms_locales\`;`)
  await db.run(sql`DROP TABLE \`form_submissions_submission_data\`;`)
  await db.run(sql`DROP TABLE \`form_submissions\`;`)
  await db.run(sql`DROP TABLE \`redirects\`;`)
  await db.run(sql`DROP TABLE \`redirects_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`admin_settings\`;`)
  await db.run(sql`DROP TABLE \`footer_columns_nav_items\`;`)
  await db.run(sql`DROP TABLE \`footer_columns\`;`)
  await db.run(sql`DROP TABLE \`footer\`;`)
  await db.run(sql`DROP TABLE \`footer_rels\`;`)
  await db.run(sql`DROP TABLE \`main_menu_tabs_description_links\`;`)
  await db.run(sql`DROP TABLE \`main_menu_tabs_nav_items_featured_link_links\`;`)
  await db.run(sql`DROP TABLE \`main_menu_tabs_nav_items_list_links_links\`;`)
  await db.run(sql`DROP TABLE \`main_menu_tabs_nav_items\`;`)
  await db.run(sql`DROP TABLE \`main_menu_tabs\`;`)
  await db.run(sql`DROP TABLE \`main_menu\`;`)
  await db.run(sql`DROP TABLE \`main_menu_rels\`;`)
  await db.run(sql`DROP TABLE \`top_bar\`;`)
  await db.run(sql`DROP TABLE \`top_bar_rels\`;`)
  await db.run(sql`DROP TABLE \`get_started_blocks_rich_text_block\`;`)
  await db.run(sql`DROP TABLE \`get_started_sidebar_links\`;`)
  await db.run(sql`DROP TABLE \`get_started\`;`)
  await db.run(sql`DROP TABLE \`get_started_locales\`;`)
  await db.run(sql`DROP TABLE \`get_started_rels\`;`)
  await db.run(sql`DROP TABLE \`partner_program_hero_breadcrumb_bar_links\`;`)
  await db.run(sql`DROP TABLE \`partner_program_hero_hero_links\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_cta_cta_fields_links\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_card_grid_card_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_card_grid_card_grid_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_form\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_hover_cards_hover_cards_fields_cards\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_hover_cards\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_link_grid_link_grid_fields_links\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_link_grid\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_logo_grid_logo_grid_fields_logos\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_logo_grid\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_reusable_content_block\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_slider_slider_fields_links\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_slider_slider_fields_quote_slides\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_slider\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_steps_steps_fields_steps\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_steps\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_code_example_block\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_media_example_block\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_example_tabs_tabs\`;`)
  await db.run(sql`DROP TABLE \`partner_program_blocks_example_tabs\`;`)
  await db.run(sql`DROP TABLE \`partner_program\`;`)
  await db.run(sql`DROP TABLE \`partner_program_rels\`;`)
}
