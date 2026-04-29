# Payload website

A full **Next.js + Payload** app: one deployable unit that serves the public **payloadcms.com** experience (this repo: [ceccec/website](https://github.com/ceccec/website) · upstream [payloadcms/website](https://github.com/payloadcms/website)).

**Jump:** [What is delivered](#what-is-delivered-when-deployed) · [Deploy](#deploy) · [Manual](#copy-paste-deploy-manual) · [Vercel path](#vercel-postgres-and-blob) · [Cloudflare path](#cloudflare-workers-d1-and-r2) · [Runtime](#runtime--environment) · [Local](#local-development)

---

## What is delivered when deployed

When you run this app in production, you get a **single site** with the following **live surfaces** (actual routes and feature flags depend on your env and data).

| Delivered | What the visitor or operator gets |
|-----------|-------------------------------------|
| **Marketing site** | Public pages (home, product, partners, case studies, pricing, etc.), dynamic routing, search integrations where configured, sitemap and OG metadata when env is set. |
| **Documentation app** | Docs UI backed by Payload content; sources can be synced from the [payload repo](https://github.com/payloadcms/payload), loaded by branch (`/docs/dynamic/...`), or from a local checkout (`/docs/local/...` + `DOCS_DIR_V3`). |
| **Payload Admin** | CMS at **`/admin`** — collections, globals, uploads, redirects, form builder, SEO fields, and admin UX included in this codebase. |
| **APIs** | Payload **REST** and **GraphQL** as enabled in config; **Local API** for server components and routes. |
| **Payload Cloud (product UI)** | In-app flows to manage **Payload Cloud** projects (GitHub connect, deployments, billing) when Cloud-related env and integrations are configured — **Stripe** and **GraphQL** for Cloud in this repo. |
| **Media & cache** | Uploads on **Vercel Blob** or **Cloudflare R2** depending on stack; Workers builds also use **R2** for OpenNext incremental cache per [`wrangler.jsonc`](./wrangler.jsonc). |
| **Persistence** | Content in **Postgres** or **Cloudflare D1** (SQLite), selected automatically from env — see [Runtime](#runtime--environment). Same product shape; **not** interchangeable DB files between the two engines. |

Stack: Next.js 15 (App Router), TypeScript, SCSS modules, [Lexical](https://payloadcms.com/docs/rich-text/lexical) / MDX flows for docs, light/dark UI without first-paint flicker on the marketing surfaces.

![Payload headless CMS website](https://payloadcms.com/images/og-image.jpg)

---

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fceccec%2Fwebsite)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ceccec/website)

Buttons clone **ceccec/website**. Replace `ceccec` with `payloadcms` in both URLs for upstream.

---

## Copy-paste deploy manual

Same **deliverables** as above once install and env match your host. Use **`ceccec/website`** below or change `ORIGIN` once.

### Requirements

From [`package.json`](./package.json) `engines`:

```bash
node -v   # expect >= 20.9.0
pnpm -v   # expect >= 10.33.2
```

Install dependencies once:

```bash
export ORIGIN=https://github.com/ceccec/website.git   # or upstream: https://github.com/payloadcms/website.git
git clone "$ORIGIN" website && cd website
corepack enable pnpm   # optional; ensures pnpm matches packageManager
pnpm i
```

---

### Vercel Postgres and Blob

Stack selection is automatic when Postgres URLs are set — see [Runtime](#runtime--environment).

```bash
cp .env.example .env
```

Edit `.env` (minimum for relational deploy — full list in [`.env.example`](./.env.example)):

```bash
# Paste into .env (replace placeholders)
POSTGRES_URL="postgresql://USER:PASS@HOST/DB?sslmode=require"
DATABASE_URL="$POSTGRES_URL"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
PAYLOAD_SECRET="$(openssl rand -hex 32)"
PAYLOAD_HOSTING=vercel
```

Deploy build (matches typical Vercel **Build Command**):

```bash
pnpm build
```

Or configure Vercel **Install Command** `pnpm i`, **Build Command** `pnpm build`, add env vars in the dashboard. Guide: [with-vercel-website](https://github.com/payloadcms/payload/blob/main/templates/with-vercel-website/README.md).

---

### Cloudflare Workers D1 and R2

For D1, avoid stray `postgres://…` in env (else Vercel stack wins), or set **`PAYLOAD_HOSTING=cloudflare`**. See [Runtime](#runtime--environment).

```bash
cp .env.example .env
cp .dev.vars.example .dev.vars
```

Edit `.env` / `.dev.vars` — at least `PAYLOAD_SECRET`. Put production secrets in [Workers dashboard](https://developers.cloudflare.com/workers/configuration/secrets/) or Wrangler as needed.

Create D1 and wire `database_id` ([docs](https://developers.cloudflare.com/d1/get-started/)):

```bash
pnpm exec wrangler d1 create website-db
```

Copy the printed **`database_id`** into [`wrangler.jsonc`](./wrangler.jsonc) under `d1_databases[0].database_id`.

Full Cloudflare deploy (migrate + OpenNext + deploy Worker):

```bash
pnpm run deploy
```

Split CI / local pipeline:

```bash
pnpm run workers:build    # deploy:database + opennext:build
pnpm run workers:deploy   # wrangler deploy via opennext
```

Dry-run config without publishing:

```bash
pnpm run deploy:dry
```

References: [DEPLOYMENT.md](./DEPLOYMENT.md), [with-cloudflare-d1](https://github.com/payloadcms/payload/blob/main/templates/with-cloudflare-d1/README.md).

---

## Runtime & environment

Resolved in [`src/lib/deploymentTarget.ts`](./src/lib/deploymentTarget.ts) (see [`src/payload.config.ts`](./src/payload.config.ts)): **Wrangler / Workers runtime → Cloudflare**; **else Vercel** when `VERCEL=1` or `postgres://…` is set; overrides via `PAYLOAD_HOSTING`.

| Stack | Typical triggers | DB | Files |
|-------|------------------|-----|--------|
| **Cloudflare** | Worker runtime (`navigator.userAgent` includes `Cloudflare-Workers`), **or** no `VERCEL` / no Postgres URL (Node migrate toward D1), **or** `PAYLOAD_HOSTING=cloudflare` | [D1](https://developers.cloudflare.com/d1/) | [R2](https://developers.cloudflare.com/r2/) + OpenNext cache |
| **Vercel** | `VERCEL=1`, **or** `POSTGRES_URL` / `DATABASE_URL` is `postgres://…`, **or** `PAYLOAD_HOSTING=vercel` (+ Postgres URL per config) | [Postgres](https://github.com/payloadcms/payload/tree/main/packages/db-postgres) | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |

- **`pnpm exec payload migrate`** per production DB ([migrations](https://payloadcms.com/docs/database/migrations); [`src/migrations/index.ts`](./src/migrations/index.ts)). D1 and Postgres are separate schemas.
- **Workers CI:** if Postgres vars leak in, set **`PAYLOAD_HOSTING=cloudflare`** so migrate targets D1.

Templates: [**with-cloudflare-d1**](https://github.com/payloadcms/payload/tree/main/templates/with-cloudflare-d1) · [**with-vercel-website**](https://github.com/payloadcms/payload/tree/main/templates/with-vercel-website)

**Scripts (copy one line)**

```bash
pnpm build                  # generate:llms + migrate + next build — default Vercel-style
pnpm run deploy:database    # migrate (+ remote D1 PRAGMA optimize on Cloudflare path)
pnpm run workers:build      # deploy:database + opennext build — use for Workers, not plain build
pnpm run workers:deploy     # deploy Worker after workers:build
pnpm run deploy             # deploy:database + full Worker pipeline
pnpm run deploy:dry         # dry-run Vercel + Cloudflare configs
```

---

## Local development

Run the same app locally (deliverables depend on `.env`):

```bash
pnpm i
cp .env.example .env
pnpm dev
```

Cloud UI expects **`https://local.payloadcms.com:3000`**:

```text
# /etc/hosts (or Windows equivalent)
127.0.0.1 local.payloadcms.com
```

---

## License

[MIT](https://github.com/ceccec/website/blob/main/LICENSE).
