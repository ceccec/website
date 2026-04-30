# Payload website

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fceccec%2Fwebsite) [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ceccec/website)

A full **Next.js + Payload** app: one deployable unit that serves the public **payloadcms.com** experience (this repo: [ceccec/website](https://github.com/ceccec/website) · upstream [payloadcms/website](https://github.com/payloadcms/website)).

**Jump:** [What is delivered](#what-is-delivered-when-deployed) · [Deploy](#deploy) · [Manual](#copy-paste-deploy-manual) · [Vercel path](#vercel-postgres-and-blob) · [Cloudflare path](#cloudflare-workers-d1-and-r2) · [Runtime](#runtime--environment) · [Docker](#docker-compose-node-mongodb--nginx) · [Local](#local-development)

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

The buttons above point at **ceccec/website**; replace `ceccec` with `payloadcms` for upstream.

### Deploy to Cloudflare (per [Cloudflare documentation](https://developers.cloudflare.com/workers/platform/deploy-buttons/))

Only what that page states (see the page for full wording and examples):

- **What the button does:** clone the Git repository into the user’s **GitHub or GitLab** account; **configure** the project (repository name, Worker name, required resource names) on one setup page (changes reflected in the created repo); **build and deploy** with [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) and deploy to the Cloudflare network — **required resources are automatically provisioned and bound** to the Worker without additional setup.
- **Embedding:** use the [Markdown / HTML / URL snippets](https://developers.cloudflare.com/workers/platform/deploy-buttons/#how-to-set-up-deploy-to-cloudflare-buttons) and replace the repository URL (optional subdirectory per that section). If you already use Workers Builds, you can copy a button snippet from the dashboard (**share** on the Worker).
- **[Automatic resource provisioning](https://developers.cloudflare.com/workers/platform/deploy-buttons/#automatic-resource-provisioning):** Cloudflare **reads the Wrangler configuration file** in your repo to determine resource requirements, provisions resources, and **updates the Wrangler configuration** where applicable for newly created resources (for example database Ids and namespace Ids). Your repository must include **default values for resource names, resource Ids and any other properties for each binding.** Supported resource types are listed on that page.
- **[Worker environment variables and secrets](https://developers.cloudflare.com/workers/platform/deploy-buttons/#worker-environment-variables-and-secrets):** [environment variables](https://developers.cloudflare.com/workers/configuration/environment-variables/) may be set in Wrangler as usual (`vars`). [Secrets](https://developers.cloudflare.com/workers/configuration/secrets/) may be listed in **`.dev.vars.example`** or **`.env.example`** in [dotenv](https://www.npmjs.com/package/dotenv) format. [Secrets Store](https://developers.cloudflare.com/secrets-store/) bindings may be configured in Wrangler as in the doc’s examples.
- **[Best practices](https://developers.cloudflare.com/workers/platform/deploy-buttons/#best-practices):** custom **`build`** and **`deploy`** scripts in **`package.json`** are **automatically detected** and pre-populated; users may change or accept them. If there is **no `deploy` script**, Cloudflare preconfigures **`npx wrangler deploy`**. If there is **no `build` script**, the build field is left **blank**. For **D1 migrations** run from **`deploy`**, the migration command should reference the **binding name**, not the database name. Optional **`package.json` → `cloudflare` → `bindings`** entries may include a **`description`** per binding (including env vars/secrets); inline markdown is supported — see the doc’s example.
- **[Limitations](https://developers.cloudflare.com/workers/platform/deploy-buttons/#limitations):** monorepo caveats, subdirectory rules, one Deploy button per Workers app in a monorepo, **Workers only** (not Pages), **github.com** / **gitlab.com** only (no self-hosted), **public** repositories only.

### This repository (not part of Cloudflare’s deploy-button spec)

- **Workers build path:** [`scripts/build.mjs`](./scripts/build.mjs) (often **`pnpm run workers:build`** on CI). **Deploy:** [`package.json`](./package.json) scripts (e.g. **`workers:deploy`**, **`deploy`**). See **[Runtime](#runtime--environment)** and [DEPLOYMENT.md](./DEPLOYMENT.md).
- **Binding descriptions for `cloudflare.bindings`:** [`config/cloudflare.bindings.json`](./config/cloudflare.bindings.json) → **`pnpm sync:cloudflare-bindings`** → [`package.json`](./package.json).
- **Wrangler:** [`wrangler.jsonc`](./wrangler.jsonc). **Env catalog (this codebase):** [`config/cloudflare-env-reference.md`](./config/cloudflare-env-reference.md).

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

Edit `.env` / `.dev.vars` — at least `PAYLOAD_SECRET` (**required** for **`pnpm build`** / `payload migrate` in CI too — add the same value under Workers **build** env vars).

Create **two** D1 databases and paste each **`database_id`** into [`wrangler.jsonc`](./wrangler.jsonc) ([D1 get started](https://developers.cloudflare.com/d1/get-started/)):

```bash
pnpm exec wrangler d1 create payload-website
pnpm exec wrangler d1 create payload-website-next-tag-cache
```

- **`d1_databases[0]`** (`binding`: `D1`) — Payload CMS data (`payload migrate`).
- **`d1_databases[1]`** (`binding`: `NEXT_TAG_CACHE_D1`) — OpenNext on-demand tag cache ([OpenNext caching](https://opennext.js.org/cloudflare/caching)); SQL migrations live in [`d1-migrations/next-tag-cache/`](./d1-migrations/next-tag-cache/).

**Durable Objects:** OpenNext’s revalidation queue (`NEXT_CACHE_DO_QUEUE` / `DOQueueHandler`) is declared in `wrangler.jsonc` with a **migrations** entry — first deploy applies the DO migration.

Full Cloudflare deploy (migrate + OpenNext + deploy Worker):

```bash
pnpm run deploy
```

Explicit Workers pipeline (same as Cloudflare branch of `pnpm build`):

```bash
pnpm run workers:build    # deploy:database + opennext:build
pnpm run workers:deploy   # wrangler deploy via opennext
```

Dry-run config without publishing:

```bash
pnpm run deploy:dry
```

References: [DEPLOYMENT.md](./DEPLOYMENT.md), [DOCKER.md](./DOCKER.md), [with-cloudflare-d1](https://github.com/payloadcms/payload/blob/main/templates/with-cloudflare-d1/README.md).

**Minimal vs full Cloudflare stack:** Default [`wrangler.jsonc`](./wrangler.jsonc) is enough to ship. Extra products (KV, Queues, Hyperdrive, Workers AI, Vectorize, …) are **optional** — merge snippets from [`config/wrangler.optional-bindings.jsonc`](./config/wrangler.optional-bindings.jsonc) only after you provision them ([DEPLOYMENT.md](./DEPLOYMENT.md#minimal-cloudflare-vs-optional-platform-bindings-choose-what-you-use)).

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
pnpm build                  # routes via scripts/build.mjs → Vercel: next build | Workers CI: workers:build (OpenNext)
pnpm run build:vercel       # `PAYLOAD_HOSTING=vercel` + same pipeline as `pnpm build` on the Node/Vercel/Docker stack
pnpm run deploy:database    # migrate (+ remote D1 PRAGMA optimize on Cloudflare path)
pnpm run workers:build      # deploy:database + opennext:build (also invoked by `pnpm build` on Workers CI)
pnpm run workers:deploy     # deploy Worker after workers:build
pnpm run deploy             # deploy:database + full Worker pipeline
pnpm run deploy:dry         # dry-run Vercel + Cloudflare configs
pnpm sync:cloudflare-bindings  # config/cloudflare.bindings.json → package.json `cloudflare.bindings`
```

---

## Docker Compose (Node + MongoDB + Nginx)

For a **containerized** Node stack — MongoDB, MinIO (S3), Mailpit (SMTP), Next + Payload on a **Unix socket**, and **Nginx** as the HTTP edge — see **[DOCKER.md](./DOCKER.md)** and **[docker/CONVENTIONS.md](./docker/CONVENTIONS.md)** (infrastructure = standard Docker images; no Vercel Blob / SendGrid required for core behavior). This path uses **`PAYLOAD_HOSTING=vercel`**; it does **not** replace **Cloudflare Workers + D1** ([Runtime](#runtime--environment)).

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
