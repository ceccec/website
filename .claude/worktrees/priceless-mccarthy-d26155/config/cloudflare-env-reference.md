# Cloudflare / Workers environment reference (full catalog)

Per [**Deploy to Cloudflare buttons**](https://developers.cloudflare.com/workers/platform/deploy-buttons/) — [**Worker environment variables and secrets**](https://developers.cloudflare.com/workers/platform/deploy-buttons/#worker-environment-variables-and-secrets): optional **`package.json` → `cloudflare` → `bindings`** may supply a **`description`** per binding; [**Automatic resource provisioning**](https://developers.cloudflare.com/workers/platform/deploy-buttons/#automatic-resource-provisioning): Cloudflare reads the **Wrangler** file in the repo (here: [`wrangler.jsonc`](../wrangler.jsonc)).

**This file** is a **repository-maintained** table of environment variables used by this codebase (not an exhaustive list from Cloudflare).

---

## Variables

| Variable | Description |
|----------|-------------|
| `ANALYZE` | **Optional.** Set to `true` only when running `pnpm analyze` (Next bundle analyzer). |
| `BLOB_READ_WRITE_TOKEN` | **Optional.** Vercel Blob read/write token — **Vercel + Postgres path only** (`@payloadcms/storage-vercel-blob`). Omit on Cloudflare R2. |
| `CLOUDFLARE_ENV` | **Optional.** Wrangler environment name for `getPlatformProxy` when resolving bindings locally (see Payload Cloudflare template). |
| `CLOUDFLARE_REMOTE_BINDINGS` | **Optional.** Set to `true` so local dev uses **remote** D1/R2/etc. via Wrangler (`getPlatformProxy` + `initOpenNextCloudflareForDev`) — pairs with `CLOUDFLARE_ENV`. |
| `COMMIT_DOCS_API_KEY` | **Optional.** Secret — internal docs commit webhook (`collections/Docs`). |
| `COMMIT_DOCS_API_URL` | **Optional.** Endpoint URL paired with `COMMIT_DOCS_API_KEY` for docs automation. |
| `COOKIE_DOMAIN` | **Optional.** Auth cookie `domain` for Payload Users (`collections/Users.ts`). Often empty locally. |
| `CRON_SECRET` | **Optional.** Bearer for Payload `jobs` / cron access (see `templates/website` + `templates/with-vercel-website`). Same role as `NEXT_PRIVATE_CRON_KEY` — either may be set. |
| `DATABASE_URL` | **Optional.** Postgres (`postgres://…`) or Mongo (`mongodb://…`) on Node/Vercel only — omit on Workers+D1 (`deploymentTarget.ts`). |
| `DISABLE_SECURE_COOKIE` | **Optional.** Set to disable `Secure` / `SameSite=None` on auth cookies even in production (testing only). |
| `DISCORD_SCRAPE_CHANNEL_ID` | **Optional.** Discord channel Id for community-help scraping flows. |
| `DISCORD_TOKEN` | **Optional.** Secret — Discord bot token for integrations. |
| `DOCS_DIR_V2` | **Optional.** Local filesystem path to v2 docs checkout (`src/scripts/fetchDocs.ts`). |
| `DOCS_DIR_V3` | **Optional.** Local filesystem path to v3 docs checkout (`src/scripts/fetchDocs.ts`). |
| `GA_CREDENTIALS` | **Optional.** Secret — Google Analytics Data API credentials JSON (`api/analytics/*`). Store as Worker secret. |
| `GA_PROPERTY_ID` | **Optional.** GA4 property Id for server-side analytics routes. |
| `GA_USE_DEMO_DATA` | **Optional.** Set `true` to use demo data in analytics API routes instead of live GA. |
| `GITHUB_ACCESS_TOKEN` | **Optional.** GitHub PAT — `pnpm generate:llms` (add to **Build variables and secrets** for CI), docs branches, ContributionTable. See [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/). |
| `MONGODB_URL` | **Optional.** MongoDB connection string — **Node / Vercel only** (`templates/with-vercel-mongodb`). Do not set on Cloudflare Workers deploys. |
| `NEXT_PRIVATE_ALGOLIA_API_KEY` | **Optional.** Secret. Algolia admin/search key for server-side community-help indexing — Worker secret. |
| `NEXT_PRIVATE_CRON_KEY` | **Optional.** Secret. Shared key for cron-triggered routes (if configured). |
| `NEXT_PRIVATE_DRAFT_SECRET` | **Optional.** Secret. Preview/draft mode secret — must match draft URL generation (`formatPreviewURL`). |
| `NEXT_PRIVATE_HUBSPOT_PORTAL_KEY` | **Optional.** Secret. HubSpot portal Id / key for form integrations in Payload config. |
| `NEXT_PRIVATE_RECAPTCHA_SECRET_KEY` | **Optional.** Secret. reCAPTCHA server-side verification key (Payload forms). |
| `NEXT_PRIVATE_REVALIdATION_KEY` | **Optional.** Secret. On-demand ISR/revalidate API (`api/revalidate`) — must match internal `revalidate` utility. |
| `NEXT_PUBLIC_ALGOLIA_CH_ID` | **Optional.** Public. Algolia app Id for community help search — **Build** env when you need it in the bundle. |
| `NEXT_PUBLIC_ALGOLIA_CH_INDEX_NAME` | **Optional.** Public. Algolia index name for community help. |
| `NEXT_PUBLIC_ALGOLIA_DOCSEARCH_KEY` | **Optional.** Public. Algolia search-only API key for Docsearch component. |
| `NEXT_PUBLIC_ALGOLIA_PUBLIC_KEY` | **Optional.** Public. Algolia search client key for community help UI. |
| `NEXT_PUBLIC_CF_IMAGE_RESIZING` | **Optional.** Public. **Default:** omit or leave unset — standard Next.js `next/image` (no Cloudflare `/cdn-cgi/image/` transforms). Set `true` only on a zone that has **Image transformations** enabled if you want that paid/opt-in path; uses `src/lib/cloudflareImageLoader.ts`. Requires `NEXT_PUBLIC_SITE_URL` (or CMS URL) origin to match the zone hostname. |
| `NEXT_PUBLIC_CLOUD_CMS_URL` | **Optional.** Public. Payload Cloud GraphQL/API base URL for in-app cloud flows. |
| `NEXT_PUBLIC_CMS_URL` | **Optional.** Public. CMS origin for media/RichText (build-inlined). Prefer **Globals → Public site settings → CMS public URL**. |
| `NEXT_PUBLIC_ENABLE_BETA_DOCS` | **Optional.** Public. `true` to surface beta docs routes. |
| `NEXT_PUBLIC_ENABLE_LEGACY_DOCS` | **Optional.** Public. `true` to surface legacy (v2) docs routes. |
| `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` | **Optional.** Public. Meta Pixel Id. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | **Optional.** Public. Google Analytics measurement Id (G-…). |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | **Optional.** Public. GitHub OAuth client Id for Cloud onboarding flows. |
| `NEXT_PUBLIC_GITHUB_REDIRECT_URI` | **Optional.** Public. GitHub OAuth redirect URI registered with the OAuth app. |
| `NEXT_PUBLIC_GTM_MEASUREMENT_ID` | **Optional.** Public. Google Tag Manager container Id when using GTM component. |
| `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` | **Optional.** Public. Extra image hostnames for `next.config.js` `remotePatterns` (comma-separated or as configured). |
| `NEXT_PUBLIC_IS_LIVE` | **Optional.** Public. When set, tightens image hosts / production behavior in `next.config.js`. |
| `NEXT_PUBLIC_NEWSLETTER_FORM_ID` | **Optional.** Public. HubSpot or form embed Id for newsletter block. |
| `NEXT_PUBLIC_OMIT_CLOUD_ERRORS` | **Optional.** Public. `true` to hide Cloud GraphQL errors in the Auth provider (demo/support). |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | **Optional.** Public. reCAPTCHA site key (forms). |
| `NEXT_PUBLIC_SERVER_URL` | **Optional.** Public. Legacy alias (`getServerSideURL`); prefer `PAYLOAD_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` in `src/utilities/getURL.ts`. |
| `NEXT_PUBLIC_SITE_URL` | **Optional.** Public. Canonical URL for metadata/OG (build-inlined). Prefer **Globals → Public site settings → Canonical site URL**; set here only to inline at build. |
| `NEXT_PUBLIC_SKIP_BUILD_DOCS` | **Optional.** Public. Skip docs page generation during build when truthy. |
| `NEXT_PUBLIC_SKIP_BUILD_HELPS` | **Optional.** Public. Skip community-help build paths when truthy. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Optional.** Public. Stripe publishable key for Checkout embedded UI. |
| `PAYLOAD_ADMIN_FAVICON_URL` | **Optional.** Absolute or `/` URL for admin favicon (`admin.meta.icons`, `examples/whitelabel`). |
| `PAYLOAD_ADMIN_META_DESCRIPTION` | **Optional.** Meta description for Payload admin (`admin.meta.description`). |
| `PAYLOAD_ADMIN_TITLE_SUFFIX` | **Optional.** Title suffix in Payload admin (`admin.meta.titleSuffix`, `examples/whitelabel`). |
| `PAYLOAD_CORS_ORIGINS` | **Optional.** Comma-separated allowed origins for Payload CORS (`payload.config.ts`). |
| `PAYLOAD_DB_ADAPTER` | **Optional.** Set `mongodb` to use `@payloadcms/db-mongodb` when the URL would otherwise be ambiguous. Usually inferred from `MONGODB_URL` / `DATABASE_URL`. |
| `PAYLOAD_ECOMMERCE` | **Optional.** Set `true` to enable `@payloadcms/plugin-ecommerce` (beta — `templates/ecommerce`). Uses `users` as customers; Stripe checkout wiring is separate (`payments.paymentMethods`). Run `payload migrate` after enabling. |
| `PAYLOAD_ECOMMERCE_VARIANTS` | **Optional.** With `PAYLOAD_ECOMMERCE`, set `true` to enable variant collections (`variants`, `variantTypes`, `variantOptions`). Run `payload migrate` after enabling. |
| `PAYLOAD_HOSTING` | **Optional.** Override: `cloudflare` \| `vercel` — forces stack when CI env would otherwise mis-detect (`deploymentTarget.ts`). |
| `PAYLOAD_LOG_LEVEL` | **Optional.** `info` \| `debug` \| `warn` \| `error` — Payload logger. |
| `PAYLOAD_MCP` | **Optional.** Set `true` to enable `@payloadcms/plugin-mcp` ([docs](https://payloadcms.com/docs/plugins/mcp)) — see `src/plugins/mcp/config.ts`. |
| `PAYLOAD_MULTI_TENANT` | **Optional.** Set `true` to enable `@payloadcms/plugin-multi-tenant` on the `pages` collection + `tenants` (`examples/multi-tenant`). Run `payload migrate` after enabling. |
| `PAYLOAD_PUBLIC_APP_URL` | **Optional.** Server URL for Payload `serverURL`/CORS. Prefer **Globals → Public site settings → Canonical site URL**. |
| `PAYLOAD_RELEASE_SECRET` | **Optional.** Secret. Shared with GitHub Actions for release automation webhooks. |
| `PAYLOAD_SECRET` | **Required.** Session/crypto secret for Payload + `payload migrate` (`openssl rand -hex 32`). Same value in Worker **Variables & Secrets** and **Build variables and secrets**. Prefer **Admin → Globals** for URLs and integrations; Worker env only for **`NEXT_PUBLIC_*`** inlining or secrets outside Admin. |
| `POSTGRES_URL` | **Optional.** Postgres URL — **Vercel relational stack**. Leave unset on Workers+D1 to avoid misrouting migrate (`deploymentTarget.ts`). |
| `SENDGRId_API_KEY` | **Optional.** Secret — SendGrid API key (nodemailer in `payload.config.ts`). |
| `SITEMAP_URL` | **Optional.** Canonical site URL for `next-sitemap` generation (defaults to payloadcms.com if unset). |
| `STRIPE_SECRET_KEY` | **Optional.** Secret. Stripe secret API key — billing routes and (with publishable key + `PAYLOAD_ECOMMERCE`) `plugin-ecommerce` payments adapter. |
| `STRIPE_WEBHOOK_SECRET` | **Optional.** Secret — Stripe webhook signing secret (`whsec_…`) for `/api/payments/stripe/webhooks`. Alias: `STRIPE_WEBHOOKS_SIGNING_SECRET`. |
| `SYNC_BATCH_LIMIT` | **Optional.** Numeric batch size override for `fetchGitHub.ts` sync scripts. |
| `VERCEL` | **Optional.** Omit on Workers. Read-only on Vercel (`VERCEL=1` in CI); pairs with `POSTGRES_URL` for stack detection. |
| `VERCEL_REDEPLOY_URL` | **Optional.** Vercel deploy hook URL — used by `redeployWebsite.ts` script. |

---

See also [`config/cloudflare-platform-coverage.md`](./cloudflare-platform-coverage.md).
