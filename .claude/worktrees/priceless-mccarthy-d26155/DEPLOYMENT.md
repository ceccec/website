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

At runtime, [`src/payload.config.ts`](src/payload.config.ts) resolves **OpenNext `CloudflareContext`** for D1 + R2 (after [`assertCloudflarePayloadBindings`](src/lib/assertCloudflarePayloadBindings.ts)). Local dev mirrors prod binding behavior via **`CLOUDFLARE_REMOTE_BINDINGS=true`** (remote D1/R2) and **`CLOUDFLARE_ENV`** when using Wrangler environments — see [`config/cloudflare-env-reference.md`](config/cloudflare-env-reference.md) (`CLOUDFLARE_*` rows).

**Cursor MCP:** With **[Payload](https://payloadcms.com/docs)** and **[Cloudflare](https://developers.cloudflare.com/workers/)** MCP servers enabled in Cursor, you can cross-check bindings and env against current docs; this repo cannot invoke those MCPs from CI.

### Minimal Cloudflare vs optional platform bindings (choose what you use)

**Minimal (default):** [`wrangler.jsonc`](wrangler.jsonc) already declares only what **Payload + OpenNext** need on Workers: **D1**, **R2** (media + incremental cache), **static assets**, **Images**, **service self-reference**, plus **observability**. No KV, Queues, Hyperdrive, AI, Vectorize, etc. Deploy works with **none** of the extras.

**Optional (opt-in):** To use additional Cloudflare products, **provision** the resource (CLI or dashboard), then **merge** the matching JSON into `wrangler.jsonc` (same root object). Copy/paste patterns and doc links live in [`config/wrangler.optional-bindings.jsonc`](config/wrangler.optional-bindings.jsonc). Only add bindings you actually use — unused bindings add noise and permission surface.

**TypeScript:** After adding bindings, extend types via [`cloudflare-env.overrides.d.ts`](cloudflare-env.overrides.d.ts) (see [`cloudflare-env.overrides.example.d.ts`](cloudflare-env.overrides.example.d.ts)) and run **`pnpm run cf-typegen`**.

**App code:** This repo does not call optional bindings (e.g. KV) until **you** add routes or jobs that use `env.*`. OpenNext continues to own `.open-next/worker.js`; advanced bindings (e.g. Durable Objects) may need a custom Worker layout — treat those as expert-only.

### Deploy to Cloudflare (documentation only)

Authoritative behavior is **[Deploy to Cloudflare buttons](https://developers.cloudflare.com/workers/platform/deploy-buttons/)**. In particular:

- **[Worker environment variables and secrets](https://developers.cloudflare.com/workers/platform/deploy-buttons/#worker-environment-variables-and-secrets):** secrets may appear in **`.dev.vars.example`** or **`.env.example`** (dotenv format); optional **`package.json` → `cloudflare` → `bindings`** with a **`description`** per key — see **[Best practices](https://developers.cloudflare.com/workers/platform/deploy-buttons/#best-practices)**.
- **Wrangler** resource requirements and defaults: **[Automatic resource provisioning](https://developers.cloudflare.com/workers/platform/deploy-buttons/#automatic-resource-provisioning)**.

**This repo:** [`config/cloudflare.bindings.json`](config/cloudflare.bindings.json) → **`pnpm sync:cloudflare-bindings`** → [`package.json`](package.json); [`wrangler.jsonc`](wrangler.jsonc); env table [`config/cloudflare-env-reference.md`](config/cloudflare-env-reference.md).

### Builds and secrets (this repo)

[`scripts/build.mjs`](scripts/build.mjs) runs **`payload migrate`** on some paths. If the build needs a secret, set it per [**Workers Builds — Build variables and secrets**](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) as well as Worker secrets when applicable.

## Checklist

1. Set **`database_id`** for **both** D1 bindings in [`wrangler.jsonc`](wrangler.jsonc): **`D1`** (Payload) and **`NEXT_TAG_CACHE_D1`** (OpenNext tag cache — separate database). [`scripts/migrate-production.mjs`](scripts/migrate-production.mjs) runs **`wrangler d1 migrations apply NEXT_TAG_CACHE_D1`** when the tag-cache id is real (skip with **`SKIP_NEXT_TAG_CACHE_MIGRATIONS=1`**). DO migration **`opennext-cache-v1`** applies `DOQueueHandler` on first deploy.
2. **`PAYLOAD_SECRET`:** required for **`pnpm payload migrate`** during **`pnpm build`** ([`scripts/build.mjs`](scripts/build.mjs) → **`workers:build`** on Workers CI). Set it for **[Workers Builds → Build variables and secrets](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)** if the build environment lacks it (see **Builds and secrets (this repo)** above). Generate with `openssl rand -hex 32`. Templates: [`.dev.vars.example`](.dev.vars.example), [`.env.example`](.env.example).
3. **Build / deploy:** default **`pnpm build`** runs OpenNext on Workers CI; **Deploy** — `pnpm run workers:deploy` or `npx wrangler deploy`. Full pipeline: `pnpm run deploy` per [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/). OpenNext runs **`pnpm run build`** internally; the repo sets **`OPEN_NEXT_INNER_BUILD=1`** for that nested step so it runs **`next build` only** and does not recurse into **`workers:build`**.
4. Dry run: `pnpm run deploy:cloudflare:dry` or `pnpm run deploy:dry` (local). **CI:** [`.github/workflows/deploy-dry.yml`](.github/workflows/deploy-dry.yml) (light: `vercel.json` + `wrangler types` + `verify:wiring`); full OpenNext + `wrangler deploy --dry-run` — [`.github/workflows/deploy-cloudflare-dry.yml`](.github/workflows/deploy-cloudflare-dry.yml) (**workflow_dispatch** only, heavy).

## Vercel / Postgres + Blob

When **`VERCEL=1`** or **`postgres://…`** URLs are set (or **`PAYLOAD_HOSTING=vercel`**), [`scripts/build.mjs`](scripts/build.mjs) runs **`pnpm payload migrate`** then **`next build`** (plus **`postbuild`** / sitemap). Postgres + Vercel Blob — set **`PAYLOAD_SECRET`** in Vercel env. To force D1 on Workers CI, set **`PAYLOAD_HOSTING=cloudflare`** ([`src/lib/deploymentTarget.ts`](src/lib/deploymentTarget.ts)).

**Self-hosted Docker (Mongo + MinIO + Mailpit + Nginx):** optional Compose stack — **[DOCKER.md](./DOCKER.md)** · conventions & image choices **[docker/CONVENTIONS.md](./docker/CONVENTIONS.md)**.

### Deployment target parity (`deploymentTarget`)

Stack detection is split on purpose: [`src/lib/deploymentTarget.ts`](src/lib/deploymentTarget.ts) layers **Cloudflare Workers** runtime detection (`navigator` user agent) on top of shared env rules; [`scripts/lib/deploymentTarget.mjs`](scripts/lib/deploymentTarget.mjs) implements the same **env-only** branch for Node (build scripts, no `navigator`). **Keep both files aligned** when changing routing (`PAYLOAD_HOSTING`, `VERCEL`, Postgres URL checks, Mongo hints, etc.), then verify **`pnpm build`** / [`scripts/build.mjs`](scripts/build.mjs) on the stack you use (Workers vs Vercel).
