# Docker Compose — self-contained Node stack

Self-hosted **Next.js + Payload** using **only conventional Docker images** for infrastructure (see **[docker/CONVENTIONS.md](docker/CONVENTIONS.md)**). This path is **orthogonal** to **Cloudflare Workers + D1 + OpenNext** — [README — Runtime & environment](README.md#runtime--environment), [DEPLOYMENT.md](DEPLOYMENT.md).

## What you get (images)

| Service | Image | Role |
|---------|-------|------|
| **`mongo`** | `mongo:7` | Payload [`mongooseAdapter`](https://payloadcms.com/docs/database/mongodb) — [`src/lib/payloadDb.ts`](src/lib/payloadDb.ts). |
| **`minio`** | `minio/minio` | S3-compatible API; [`@payloadcms/storage-s3`](https://payloadcms.com/docs/upload/storage-adapters) — [`src/plugins/storage/config.ts`](src/plugins/storage/config.ts). **Replaces** Vercel Blob / R2 for uploads. |
| **`minio-init`** | `minio/mc` | Creates bucket `payload-media`, anonymous download — [`docker/minio/init-bucket.sh`](docker/minio/init-bucket.sh). |
| **`mailpit`** | `axllent/mailpit` | SMTP `:1025`, web UI `:8025`. **Replaces** SendGrid for outbound mail testing/capture — [`src/payload.config.ts`](src/payload.config.ts) when `SMTP_HOST` is set. |
| **`app`** | Build from [`Dockerfile`](Dockerfile) (`node:22-bookworm-slim`) | `pnpm build`, `payload migrate`, [`scripts/next-start-unix.mjs`](scripts/next-start-unix.mjs) on Unix socket only. |
| **`nginx`** | `nginx:1.27-alpine` | HTTP edge; proxies to `unix:/run/payload/next.sock` — [`docker/nginx/default.conf`](docker/nginx/default.conf). |

Between containers, **app → MongoDB / MinIO / Mailpit** uses normal **TCP** on the **`payload_net`** bridge. **Nginx → Node** uses a **shared volume** Unix socket (no TCP for the Next process).

## Files

| Path | Purpose |
|------|---------|
| [`docker-compose.yml`](docker-compose.yml) | All services, volumes, env defaults. |
| [`docker/CONVENTIONS.md`](docker/CONVENTIONS.md) | **Rules:** image-only infra, what stays optional (Algolia, Stripe, GitHub). |
| [`Dockerfile`](Dockerfile) | Multi-stage Node image. |
| [`docker/entrypoint.sh`](docker/entrypoint.sh) | `payload migrate` → Unix-socket Next server. |
| [`docker/nginx/default.conf`](docker/nginx/default.conf) | Upstream Unix socket, WebSocket, large bodies. |
| [`docker/minio/init-bucket.sh`](docker/minio/init-bucket.sh) | Bucket bootstrap. |
| [`scripts/next-start-unix.mjs`](scripts/next-start-unix.mjs) | Programmatic Next on a socket (`pnpm run start:unix`). |
| [`.env.docker.example`](.env.docker.example) | Copy to **`.env.docker`** (gitignored). |

## Prerequisites

- Docker Engine + Compose v2 (`env_file` with `required: false`).
- Resources comparable to a local `pnpm build` + production Node.

## Quick start

1. **Secrets**

   ```bash
   cp .env.docker.example .env.docker
   ```

   Set **`PAYLOAD_SECRET`** (use `openssl rand -hex 32`). Override **`MINIO_ROOT_USER`** / **`MINIO_ROOT_PASSWORD`** in a project `.env` for production.

2. **Align build-time public URL**

   `NEXT_PUBLIC_*` is inlined at **`docker compose build app`**. Set in a project **`.env`** or shell so it matches how users reach Nginx (default port **8080**):

   ```bash
   export NEXT_PUBLIC_SITE_URL=http://localhost:8080
   export PAYLOAD_PUBLIC_APP_URL=http://localhost:8080
   docker compose build app
   ```

3. **Run**

   ```bash
   docker compose up -d
   ```

4. **URLs**

   | Surface | URL |
   |---------|-----|
   | Site (via Nginx) | `http://localhost:${HTTP_PORT:-8080}` |
   | Mailpit UI | `http://127.0.0.1:8025` |
   | MinIO console | `http://127.0.0.1:9001` |
   | MongoDB (host tools) | `127.0.0.1:27018` → container `27017` |

## Header doc search without Algolia

- **All deploys:** If DocSearch API keys are unset, the header shows a **Documentation** link plus (when enabled) a small local search UI — `src/components/Header/Docsearch/LocalFallback.tsx`.
- **Docker app image** includes Debian **`ripgrep`** and compose sets **`NEXT_PUBLIC_LOCAL_DOC_SEARCH=1`** (build arg) by default. Set **`LOCAL_DOC_SEARCH_ROOT`** to a **mounted** directory of `.md` / `.mdx` files (e.g. bind-mount the Payload `docs` repo and set the path) for filename search via **`/api/docs-local-search`** (`runtime: 'nodejs'`).
- **Cloudflare Workers:** the route short-circuits with `enabled: false` — no subprocesses, compatible with the Worker runtime.
- **Vercel:** `Dockerfile` defaults **`NEXT_PUBLIC_LOCAL_DOC_SEARCH=0`**; most projects use Algolia or leave browse-only. Do not rely on `rg` on Vercel unless you add the binary and a readable docs path.

## Environment reference

### Host / Compose interpolation

| Variable | Default | Purpose |
|----------|---------|---------|
| **`HTTP_PORT`** | `8080` | Host → Nginx `80`. |
| **`MINIO_ROOT_USER`** / **`MINIO_ROOT_PASSWORD`** | `minio` / `miniochangeme` | MinIO + `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` for the app. **Change for production.** |
| **`NEXT_PUBLIC_SITE_URL`**, **`PAYLOAD_PUBLIC_APP_URL`** | `http://localhost:8080` | Build args + runtime (Payload server URL / trusted origins). |

### `app` service (from [`docker-compose.yml`](docker-compose.yml))

Defaults supply **Mongo**, **MinIO S3**, **Mailpit SMTP**, and public URLs — no **`BLOB_READ_WRITE_TOKEN`** or **`SENDGRID_API_KEY`** required for core functionality.

| Variable | Notes |
|----------|--------|
| **`MONGODB_URL`** | `mongodb://mongo:27017/payload` |
| **`S3_ENDPOINT`**, **`S3_BUCKET`**, **`S3_*`** | Point at MinIO; **`S3_FORCE_PATH_STYLE=true`** |
| **`SMTP_HOST`**, **`SMTP_PORT`** | `mailpit`, `1025` |
| **`PAYLOAD_SECRET`** | From `.env.docker` |
| **`LOCAL_DOC_SEARCH_ROOT`** | Optional; host path to markdown tree (requires volume mount + `ripgrep` in the image). |
| **`NEXT_PUBLIC_LOCAL_DOC_SEARCH`** | Build arg: `1` in compose, `0` by default in `Dockerfile` for Vercel/CF-friendly production builds. |

Optional integrations (Stripe, Algolia, etc.) — [`.env.example`](.env.example); load via **`.env.docker`** if needed.

## Operations

- **Logs:** `docker compose logs -f app nginx`
- **Rebuild:** `docker compose build app && docker compose up -d`
- **Migrations:** On each **`app`** start (`payload migrate` in [`docker/entrypoint.sh`](docker/entrypoint.sh)).

## Production hardening

See [docker/CONVENTIONS.md](docker/CONVENTIONS.md) and:

- TLS in front of Nginx
- Strong MinIO credentials; remove host port publishes you do not need (`27018`, `8025`, `9001`)
- Docker secrets / orchestrator secrets instead of plain files where possible

## Troubleshooting

- **`app` unhealthy:** Check migrate logs (`PAYLOAD_SECRET`, Mongo).
- **502 from Nginx:** Wait for app socket or inspect [`scripts/next-start-unix.mjs`](scripts/next-start-unix.mjs).
- **Wrong absolute URLs:** Rebuild **`app`** after changing **`NEXT_PUBLIC_*`**.
- **`minio-init` failed:** Ensure MinIO is reachable from `minio-init` on `payload_net`.

## Related commands

```bash
pnpm run start:unix    # Same Unix-socket server outside Docker
docker compose config  # Validate merged Compose + env
```
