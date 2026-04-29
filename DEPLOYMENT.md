# Deployment (Cloudflare Workers)

See **[What is delivered when deployed](README.md#what-is-delivered-when-deployed)** (product surfaces), **[Deploy](README.md#deploy)** (buttons), **[Copy-paste deploy manual](README.md#copy-paste-deploy-manual)** (CLI), and **[Runtime & environment](README.md#runtime--environment)** (stack matrix + scripts).

## Wrangler & D1

Use Cloudflare’s documentation as the source of truth:

- [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Remote bindings](https://developers.cloudflare.com/workers/development-testing/#remote-bindings)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

This repo’s Wrangler config is [`wrangler.jsonc`](wrangler.jsonc).

### Payload ↔ Cloudflare alignment

At runtime, [`src/payload.config.ts`](src/payload.config.ts) resolves **OpenNext `CloudflareContext`** for D1 + R2 (after [`assertCloudflarePayloadBindings`](src/lib/assertCloudflarePayloadBindings.ts)). Local dev mirrors prod binding behavior via **`CLOUDFLARE_REMOTE_BINDINGS=true`** (remote D1/R2) and **`CLOUDFLARE_ENV`** when using Wrangler environments — see [`config/cloudflare.bindings.json`](config/cloudflare.bindings.json).

**Cursor MCP:** With **[Payload](https://payloadcms.com/docs)** and **[Cloudflare](https://developers.cloudflare.com/workers/)** MCP servers enabled in Cursor, you can cross-check bindings and env against current docs; this repo cannot invoke those MCPs from CI.

### Minimal Cloudflare vs optional platform bindings (choose what you use)

**Minimal (default):** [`wrangler.jsonc`](wrangler.jsonc) already declares only what **Payload + OpenNext** need on Workers: **D1**, **R2** (media + incremental cache), **static assets**, **Images**, **service self-reference**, plus **observability**. No KV, Queues, Hyperdrive, AI, Vectorize, etc. Deploy works with **none** of the extras.

**Optional (opt-in):** To use additional Cloudflare products, **provision** the resource (CLI or dashboard), then **merge** the matching JSON into `wrangler.jsonc` (same root object). Copy/paste patterns and doc links live in [`config/wrangler.optional-bindings.jsonc`](config/wrangler.optional-bindings.jsonc). Only add bindings you actually use — unused bindings add noise and permission surface.

**TypeScript:** After adding bindings, extend types via [`cloudflare-env.overrides.d.ts`](cloudflare-env.overrides.d.ts) (see [`cloudflare-env.overrides.example.d.ts`](cloudflare-env.overrides.example.d.ts)) and run **`pnpm run cf-typegen`**.

**App code:** This repo does not call optional bindings (e.g. KV) until **you** add routes or jobs that use `env.*`. OpenNext continues to own `.open-next/worker.js`; advanced bindings (e.g. Durable Objects) may need a custom Worker layout — treat those as expert-only.

### Environment variable catalog (Deploy wizard)

Human-readable names and copy for **Deploy to Cloudflare** live in [`config/cloudflare.bindings.json`](config/cloudflare.bindings.json). Run **`pnpm sync:cloudflare-bindings`** to copy **`bindings`** into [`package.json`](package.json) under **`cloudflare.bindings`** — that is what the Deploy wizard reads (alongside [`.dev.vars.example`](.dev.vars.example)). **`PAYLOAD_SECRET`** is listed first and marked **Required**; everything else is optional reference copy. An optional root-level **`introduction`** in the JSON file is **docs-only** (not synced): it tells operators to leave other wizard fields blank and prefer **Admin → Globals** ([`PublicSiteSettings`](src/globals/PublicSiteSettings.ts), [`IntegrationSecrets`](src/globals/IntegrationSecrets.ts)) for URLs and integrations unless a value must be build-inlined (`NEXT_PUBLIC_*`) or kept outside Admin.

### Deploy to Cloudflare button + `PAYLOAD_SECRET`

Per [Deploy to Cloudflare — Worker secrets](https://developers.cloudflare.com/workers/platform/deploy-buttons/#worker-environment-variables-and-secrets), the setup flow reads **`.dev.vars.example`** / **`.env.example`** (dotenv-style) and uses **`package.json` → `cloudflare.bindings`** only for **labels and help text**. This repo already defines **`PAYLOAD_SECRET`** in [`.dev.vars.example`](.dev.vars.example), [`.env.example`](.env.example), and [`package.json`](package.json) `cloudflare.bindings`, so the wizard **should** prompt for it.

**Build vs runtime:** `pnpm build` runs **`payload migrate`** before deploy. If migrate still fails with “missing secret”, add **`PAYLOAD_SECRET`** under **Settings → Builds → [Build variables and secrets](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)** for that project (same value as the Worker secret).

## Checklist

1. Set **`database_id`** in [`wrangler.jsonc`](wrangler.jsonc) after [`wrangler d1 create`](https://developers.cloudflare.com/d1/get-started/) or provisioning (the seed flow often fills this automatically).
2. **`PAYLOAD_SECRET`:** required for **`pnpm payload migrate`** during **`pnpm build`** ([`scripts/build.mjs`](scripts/build.mjs) → **`workers:build`** on Workers CI). Set it for **[Workers Builds → Build variables and secrets](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)** if the deploy wizard did not inject it into the build environment (see **Deploy to Cloudflare button + `PAYLOAD_SECRET`** above). Generate with `openssl rand -hex 32`. Templates: [`.dev.vars.example`](.dev.vars.example), [`.env.example`](.env.example).
3. **Build / deploy:** default **`pnpm build`** runs OpenNext on Workers CI; **Deploy** — `pnpm run workers:deploy` or `npx wrangler deploy`. Full pipeline: `pnpm run deploy` per [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/). OpenNext runs **`pnpm run build`** internally; the repo sets **`OPEN_NEXT_INNER_BUILD=1`** for that nested step so it runs **`next build` only** and does not recurse into **`workers:build`**.
4. Dry run: `pnpm run deploy:cloudflare:dry` or `pnpm run deploy:dry`.

## Vercel / Postgres + Blob

When **`VERCEL=1`** or **`postgres://…`** URLs are set (or **`PAYLOAD_HOSTING=vercel`**), [`scripts/build.mjs`](scripts/build.mjs) runs **`pnpm payload migrate`** then **`next build`** (plus **`postbuild`** / sitemap). Postgres + Vercel Blob — set **`PAYLOAD_SECRET`** in Vercel env. To force D1 on Workers CI, set **`PAYLOAD_HOSTING=cloudflare`** ([`src/lib/deploymentTarget.ts`](src/lib/deploymentTarget.ts)).

**Self-hosted Docker (Mongo + MinIO + Mailpit + Nginx):** optional Compose stack — **[DOCKER.md](./DOCKER.md)** · conventions & image choices **[docker/CONVENTIONS.md](./docker/CONVENTIONS.md)**.

### Deployment target parity (`deploymentTarget`)

Stack detection is split on purpose: [`src/lib/deploymentTarget.ts`](src/lib/deploymentTarget.ts) layers **Cloudflare Workers** runtime detection (`navigator` user agent) on top of shared env rules; [`scripts/lib/deploymentTarget.mjs`](scripts/lib/deploymentTarget.mjs) implements the same **env-only** branch for Node (build scripts, no `navigator`). **Keep both files aligned** when changing routing (`PAYLOAD_HOSTING`, `VERCEL`, Postgres URL checks, Mongo hints, etc.), then verify **`pnpm build`** / [`scripts/build.mjs`](scripts/build.mjs) on the stack you use (Workers vs Vercel).
