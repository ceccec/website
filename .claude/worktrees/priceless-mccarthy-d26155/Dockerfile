# syntax=docker/dockerfile:1
# Node + Payload (Vercel/Mongo path) with Nginx in front; the app listens on a Unix socket only.
# See DOCKER.md (operators) and docker/CONVENTIONS.md (image-only independence rules).
# Build: `cp .env.docker.example .env.docker` then set `PAYLOAD_SECRET`, then
#   `docker compose build app`
# Run:  `docker compose up -d`  → site at http://localhost:${HTTP_PORT:-8080}

FROM node:22-bookworm-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PAYLOAD_HOSTING=vercel \
    SKIP_DATABASE_MIGRATE=1
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
# 0 by default so Vercel / Cloudflare builds do not enable client local-search UI unless explicitly passed.
ARG NEXT_PUBLIC_LOCAL_DOC_SEARCH=0
ENV NEXT_PUBLIC_LOCAL_DOC_SEARCH=${NEXT_PUBLIC_LOCAL_DOC_SEARCH}
RUN pnpm build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    LISTEN_UNIX_SOCKET=/run/payload/next.sock
RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init util-linux ripgrep \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
COPY --from=builder /app /app
RUN pnpm prune --prod \
  && chmod +x /app/docker/entrypoint.sh
USER root
ENTRYPOINT ["/app/docker/entrypoint.sh"]
