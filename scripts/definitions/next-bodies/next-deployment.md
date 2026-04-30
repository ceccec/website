# Next.js deployment & production

Official entry points:

| Topic | Doc |
|-------|-----|
| **Deploying** | [Getting Started — Deploying](https://nextjs.org/docs/app/getting-started/deploying) |
| **Platforms** | [Deploying to platforms](https://nextjs.org/docs/app/guides/deploying-to-platforms) |
| **Self-hosting** | [Self-hosting](https://nextjs.org/docs/app/guides/self-hosting) |
| **Production checklist** | [Production](https://nextjs.org/docs/app/guides/production-checklist) |
| **CI build cache** | [CI Build Caching](https://nextjs.org/docs/app/guides/ci-build-caching) |
| **CDN caching** | [CDN Caching](https://nextjs.org/docs/app/guides/cdn-caching) |
| **Static exports** | [Static exports](https://nextjs.org/docs/app/guides/static-exports) |
| **Adapters** | [Adapters](https://nextjs.org/docs/app/api-reference/adapters) |

## This repo

**Database migrations, Wrangler, OpenNext build/deploy, and Payload D1** are centralized in **`payload-deployment.mdc`**, `DEPLOYMENT.md`, `scripts/build.mjs`, `wrangler.jsonc`, **`open-next.config.ts`**. Next’s docs above describe **platform capabilities** (Node, edge, ISR, cache); this repo **implements** Cloudflare via OpenNext — keep behavior aligned with [OpenNext Cloudflare — caching](https://opennext.js.org/cloudflare/caching).

## Checklist

- [ ] Target platform supports required Next features ([deploying to platforms](https://nextjs.org/docs/app/guides/deploying-to-platforms)).
- [ ] **Prod build** path matches **`payload-deployment.mdc`** (migrate → build → deploy order when applicable).
- [ ] **Environment variables** follow [Environment variables](https://nextjs.org/docs/app/guides/environment-variables) and repo `.env.example` / Cloudflare bindings docs.

**More:** **`next-basics.mdc`** · **`next-caching-revalidation.mdc`** · **`payload-deployment.mdc`**
