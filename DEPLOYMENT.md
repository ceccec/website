# Deployment (Cloudflare Workers)

See **[README.md — Deployment](README.md#deployment)** for buttons and Workers Builds.

## Wrangler & D1

Use Cloudflare’s documentation as the source of truth:

- [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Remote bindings](https://developers.cloudflare.com/workers/development-testing/#remote-bindings)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

This repo’s Wrangler config is [`wrangler.jsonc`](wrangler.jsonc).

## Checklist

1. Set **`database_id`** in [`wrangler.jsonc`](wrangler.jsonc) after [`wrangler d1 create`](https://developers.cloudflare.com/d1/get-started/) or provisioning.
2. Secrets: [`.dev.vars.example`](.dev.vars.example) → `.dev.vars`; full env: [`.env.example`](.env.example).
3. Deploy: `pnpm run deploy` or `pnpm run workers:build` / `pnpm run workers:deploy` per [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/).
4. Dry run: `pnpm run deploy:cloudflare:dry` or `pnpm run deploy:dry`.

## Vercel / Postgres + Blob

When **`POSTGRES_URL`** / **`DATABASE_URL`** is Postgres (or **`PAYLOAD_HOSTING=vercel`** with that URL), Payload uses Postgres + Vercel Blob — **`pnpm build`**, **`pnpm exec payload migrate`**. Override with **`PAYLOAD_HOSTING=cloudflare`** if needed ([`src/lib/deploymentTarget.ts`](src/lib/deploymentTarget.ts)).
