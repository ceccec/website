# Docker stack conventions — self-contained functionality

This repo’s **default** [`docker-compose.yml`](../docker-compose.yml) is built so **core CMS + site behavior** does not depend on proprietary SaaS APIs. Every piece of infrastructure is a **published OCI image** you can pull from **Docker Hub**, **quay.io**, or another registry — no sidecar binaries compiled outside standard supply chains.

## Rule: infrastructure = container images

| Concern | Image (official / conventional) | Replaces (SaaS / hosted) |
|--------|-----------------------------------|----------------------------|
| Document DB | [`mongo:7`](https://hub.docker.com/_/mongo) | Atlas / hosted Mongo |
| Object storage (S3 API) | [`minio/minio`](https://hub.docker.com/r/minio/minio) + [`minio/mc`](https://hub.docker.com/r/minio/mc) for bucket bootstrap | Vercel Blob, AWS S3, Cloudflare R2 |
| SMTP / mail capture | [`axllent/mailpit`](https://hub.docker.com/r/axllent/mailpit) | SendGrid, Postmark (for dev / self-hosted mail testing) |
| HTTP reverse proxy | [`nginx`](https://hub.docker.com/_/nginx) (Alpine variant in compose) | Hosted edge (optional TLS terminator in front still OK) |
| Application runtime | [`node:22-bookworm-slim`](https://hub.docker.com/_/node) (see [`Dockerfile`](../Dockerfile)) | Vercel build image |
| Offline doc filename search (optional) | Debian package **`ripgrep`** (`/usr/bin/rg`) in the app image | Algolia DocSearch when keys are unset — see `src/app/(frontend)/api/docs-local-search/route.ts` |

Payload wiring:

- **DB:** [`mongooseAdapter`](https://payloadcms.com/docs/database/mongodb) via `MONGODB_URL` — [`src/lib/payloadDb.ts`](../src/lib/payloadDb.ts).
- **Media:** [`@payloadcms/storage-s3`](https://payloadcms.com/docs/upload/storage-adapters) when `S3_*` env vars are set — [`src/plugins/storage/config.ts`](../src/plugins/storage/config.ts); compose sets MinIO.
- **Email:** [`@payloadcms/email-nodemailer`](https://payloadcms.com/docs/email/overview) with **`SMTP_HOST`** — [`src/payload.config.ts`](../src/payload.config.ts); compose targets Mailpit.

## What stays optional (not replaced by a single “standard” container)

These are **integrations**, not the same kind of plumbing as DB/storage/mail:

| Integration | Independence |
|-------------|----------------|
| **Algolia** (doc search, community index) | Header uses `src/components/Header/Docsearch/LocalFallback.tsx`: **Documentation** link everywhere; optional **`LOCAL_DOC_SEARCH_ROOT`** + **`NEXT_PUBLIC_LOCAL_DOC_SEARCH`** ripgrep search only on **Node** hosts that ship `/usr/bin/rg`. **Cloudflare Workers:** API route returns `enabled: false` (no `child_process`). **Vercel:** unset `LOCAL_DOC_SEARCH_ROOT` unless you bundle markdown under a readable path and install `rg` yourself — usually Algolia or browse-only. |
| **Stripe / ecommerce** | Optional plugin; no Stripe keys → no live payments ([`src/plugins/ecommerce/index.ts`](../src/plugins/ecommerce/index.ts)). |
| **GitHub API** (remote docs fetch, LLM generation) | Optional; committed `public/llms*.txt` and local docs paths avoid network calls when tokens are absent ([`src/scripts/generateLLMs.ts`](../src/scripts/generateLLMs.ts), [`DOCS_DIR_*`](../.env.example)). |

## Functional independence checklist

With only compose defaults + `PAYLOAD_SECRET` in `.env.docker`:

- [x] CMS persists to **MongoDB** in the stack.
- [x] Uploads go to **MinIO** (S3), not Vercel Blob.
- [x] Outbound mail is accepted by **Mailpit** (no SendGrid).
- [x] The public site is served via **Nginx** → app **Unix socket** (no hosted edge required).
- [x] Doc search / Algolia-dependent UI does not assume keys are present (guarded in components).

## Cloudflare Workers & Vercel compatibility

The Docker Compose stack is **`PAYLOAD_HOSTING=vercel`** + Mongo/S3/SMTP — it does not replace the Workers build. Shared code paths:

- **`getDeploymentTarget()` === `cloudflare`** → `src/app/(frontend)/api/docs-local-search/route.ts` never runs **`rg`** (Workers cannot spawn subprocesses).
- **`Dockerfile`** defaults **`NEXT_PUBLIC_LOCAL_DOC_SEARCH=0`** so production **Vercel** / **Workers** client bundles do not advertise local search unless you pass a build arg. Compose overrides to **`1`** for self-hosted images.
- Storage/email/db routing in Payload stays env-driven ([`payloadDb.ts`](../src/lib/payloadDb.ts), [`storage/config.ts`](../src/plugins/storage/config.ts), [`payload.config.ts`](../src/payload.config.ts)) — no Docker-only imports on those paths.

For full details and env tables, see **[DOCKER.md](../DOCKER.md)**.
