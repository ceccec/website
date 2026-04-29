# Deployment (Cloudflare Workers)

See **[What is delivered when deployed](README.md#what-is-delivered-when-deployed)** (product surfaces), **[Deploy](README.md#deploy)** (buttons), **[Copy-paste deploy manual](README.md#copy-paste-deploy-manual)** (CLI), and **[Runtime & environment](README.md#runtime--environment)** (stack matrix + scripts).

## Wrangler & D1

Use Cloudflare’s documentation as the source of truth:

- [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Remote bindings](https://developers.cloudflare.com/workers/development-testing/#remote-bindings)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

This repo’s Wrangler config is [`wrangler.jsonc`](wrangler.jsonc).

### Deploy to Cloudflare button + `PAYLOAD_SECRET`

Per [Deploy to Cloudflare — Worker secrets](https://developers.cloudflare.com/workers/platform/deploy-buttons/#worker-environment-variables-and-secrets), the setup flow reads **`.dev.vars.example`** / **`.env.example`** (dotenv-style) and uses **`package.json` → `cloudflare.bindings`** only for **labels and help text**. This repo already defines **`PAYLOAD_SECRET`** in [`.dev.vars.example`](.dev.vars.example), [`.env.example`](.env.example), and [`package.json`](package.json) `cloudflare.bindings`, so the wizard **should** prompt for it.

**Build vs runtime:** `pnpm build` runs **`payload migrate`** before deploy. If migrate still fails with “missing secret”, add **`PAYLOAD_SECRET`** to [Workers Builds environment variables](https://developers.cloudflare.com/workers/ci-cd/builds/#environment-variables) for that project (same value as the Worker secret).

## Checklist

1. Set **`database_id`** in [`wrangler.jsonc`](wrangler.jsonc) after [`wrangler d1 create`](https://developers.cloudflare.com/d1/get-started/) or provisioning (the seed flow often fills this automatically).
2. **`PAYLOAD_SECRET`:** required for **`pnpm payload migrate`** during **`pnpm build`** ([`scripts/build.mjs`](scripts/build.mjs) → **`workers:build`** on Workers CI). Set it for [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/#environment-variables) if the deploy wizard did not inject it into the build environment (see **Deploy to Cloudflare button + `PAYLOAD_SECRET`** above). Generate with `openssl rand -hex 32`. Templates: [`.dev.vars.example`](.dev.vars.example), [`.env.example`](.env.example).
3. **Build / deploy:** default **`pnpm build`** runs OpenNext on Workers CI; **Deploy** — `pnpm run workers:deploy` or `npx wrangler deploy`. Full pipeline: `pnpm run deploy` per [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/).
4. Dry run: `pnpm run deploy:cloudflare:dry` or `pnpm run deploy:dry`.

## Vercel / Postgres + Blob

When **`VERCEL=1`** or **`postgres://…`** URLs are set (or **`PAYLOAD_HOSTING=vercel`**), [`scripts/build.mjs`](scripts/build.mjs) runs **`pnpm payload migrate`** then **`next build`** (plus **`postbuild`** / sitemap). Postgres + Vercel Blob — set **`PAYLOAD_SECRET`** in Vercel env. To force D1 on Workers CI, set **`PAYLOAD_HOSTING=cloudflare`** ([`src/lib/deploymentTarget.ts`](src/lib/deploymentTarget.ts)).
