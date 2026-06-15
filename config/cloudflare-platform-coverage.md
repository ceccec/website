# Cloudflare platform coverage (this repo)

Single reference for **what Cloudflare offers**, **what Wrangler can bind**, **what costs money**, and **what this codebase actually uses**. **Convention:** if the same outcome can be had without a paid product, **defaults stay free**; billable or zone-gated features are **opt-in** (env flags, dashboard toggles). **When free is not an option**, prefer the **smallest** extra surface: one paid path per concern (one image pipeline, one storage backend, one queue provider), avoid stacking overlapping vendors, and add **Wrangler bindings only** when code uses them — see §F. Official surfaces: [Workers runtime APIs / bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/), [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/), [pricing](https://www.cloudflare.com/plans/) (Workers, R2, Images, Stream, etc.—each product has its own billing page).

---

## A. Active in `wrangler.jsonc` (baseline deploy)

| Product / capability | Role here | App code |
|---------------------|-----------|----------|
| **Workers** | Runs OpenNext-generated Worker (`main`: `.open-next/worker.js`) | Entry stack |
| **Assets** | Static asset serving (`ASSETS` binding) | OpenNext |
| **D1** (`D1`) | SQLite for Payload (`sqliteD1Adapter`) | `src/lib/payloadDB.ts`, Payload `payload migrate` |
| **D1** (`NEXT_TAG_CACHE_D1`) | OpenNext **on-demand** tag cache ([OpenNext caching](https://opennext.js.org/cloudflare/caching)) | `d1-migrations/next-tag-cache/*.sql`, `wrangler d1 migrations apply NEXT_TAG_CACHE_D1` |
| **Durable Objects** (`NEXT_CACHE_DO_QUEUE`) | OpenNext ISR **revalidation queue** (`DOQueueHandler`) | `open-next.config.ts` → `queue: doQueue` |
| **R2** (media bucket) | Payload uploads via `@payloadcms/storage-r2` | `src/plugins/storage/config.ts` |
| **R2** (OpenNext cache bucket) | Incremental cache / ISR persistence | OpenNext `NEXT_INC_CACHE_R2_BUCKET` |
| **Workers Images binding** | Declared as `images.binding: "IMAGES"` | **Not used** in `src/` (no `env.IMAGES` Worker API). Zone **Image Transformations** via URL are **off by default**; opt in with `NEXT_PUBLIC_CF_IMAGE_RESIZING=true` + `src/lib/cloudflareImageLoader.ts`. |
| **Service binding** | `WORKER_SELF_REFERENCE` for same-script composition | OpenNext pattern |

---

## B. Declared but not implemented in application logic

| Area | Notes |
|------|--------|
| **Cloudflare Images** (transform via URL on zone) | **Default:** unset → normal Next.js images. **Opt-in:** **`NEXT_PUBLIC_CF_IMAGE_RESIZING=true`** when the zone has [transformations](https://developers.cloudflare.com/images/transform-images/transform-via-url/) enabled; **`next/image`** then uses `src/lib/cloudflareImageLoader.ts` (`/cdn-cgi/image/...`). The **`IMAGES`** Worker binding stays unused unless you add programmatic transforms via `env.IMAGES`. |
| **Cloudflare Stream** | **Not integrated**. Uploads play via HTML `<video>` + R2 URLs or external embeds (YouTube/Vimeo). Stream is **API + billing** per minute/storage—see [Stream](https://developers.cloudflare.com/stream/). |

---

## C. Optional Worker bindings (snippets only)

Copy from `config/wrangler.optional-bindings.jsonc` into root `wrangler.jsonc` **after** provisioning the resource in the dashboard or via Wrangler. Many are **paid** or have free tiers with limits.

| Binding type | Typical product | Doc / billing |
|--------------|-----------------|---------------|
| **KV** | Key-value, edge config | [KV](https://developers.cloudflare.com/kv/) |
| **Queues** | Async jobs, buffering | [Queues](https://developers.cloudflare.com/queues/) |
| **Hyperdrive** | Accelerate Postgres (remote DB from Workers) | [Hyperdrive](https://developers.cloudflare.com/hyperdrive/) |
| **Vectorize** | Vector search / RAG | [Vectorize](https://developers.cloudflare.com/vectorize/) |
| **Workers AI** | Inference binding `AI` | [Workers AI](https://developers.cloudflare.com/workers-ai/) (usage-based) |
| **Analytics Engine** | High-volume analytics writes | [Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/) |
| **Browser Rendering** | Headless browser in Workers | [Browser Rendering](https://developers.cloudflare.com/browser-rendering/) |
| **Secrets Store** | Centralized secrets bind | [Secrets Store](https://developers.cloudflare.com/secrets-store/) |
| **Cron Triggers** | Scheduled Worker runs | [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) |
| **Durable Objects** | Strong state / coordination | [DO](https://developers.cloudflare.com/durable-objects/) — note in optional file: OpenNext owns the Worker entry; extra DO wiring is advanced |

---

## D. Environment variables & secrets (deploy / CI)

**Cloudflare (documentation):** [Deploy to Cloudflare buttons](https://developers.cloudflare.com/workers/platform/deploy-buttons/) — optional **`cloudflare.bindings`** descriptions and **`.dev.vars.example` / `.env.example`** for secrets; Wrangler defaults for [automatic resource provisioning](https://developers.cloudflare.com/workers/platform/deploy-buttons/#automatic-resource-provisioning).

**This repo:** `config/cloudflare.bindings.json` → `pnpm sync:cloudflare-bindings` → `package.json`; full env table `config/cloudflare-env-reference.md`.

---

## E. “Full coverage” checklist for operators

1. **Baseline:** `wrangler.jsonc` + `PAYLOAD_SECRET` + **two D1s** (Payload + OpenNext tag cache) + Durable Object queue + R2 buckets (Payload’s `D1` + `R2` are validated at point of use — `resolvePayloadDB` in `src/lib/payloadDB.ts` and `storage` in `src/plugins/storage/config.ts`).
2. **Media:** R2 + Next Image **implemented**. **Zone image transforms:** opt in with `NEXT_PUBLIC_CF_IMAGE_RESIZING` + transformations on the zone (see §B). **Stream** is **not** integrated—plan separately if you need adaptive streaming.
3. **Optional CF primitives:** merge snippets from `wrangler.optional-bindings.jsonc` only when you have a concrete use (cache, queue, AI, etc.) and understand **pricing**.
4. **Env catalog:** document new secrets in `config/cloudflare-env-reference.md`. Add to `config/cloudflare.bindings.json` only if the **Deploy** wizard should list them; re-run `sync-cloudflare-bindings.mjs`.

---

## F. Minimal dependency surface (when a paid or metered path is required)

| Layer | Keep it small |
|-------|----------------|
| **Cloudflare products** | Baseline **Workers + D1 + R2×2** already cover DB + media + cache. Add **optional** bindings from `wrangler.optional-bindings.jsonc` only for a concrete feature; do not enable KV + Queue + Vectorize “just in case.” Image transforms: **`NEXT_PUBLIC_CF_IMAGE_RESIZING`** OR raw URLs — not both stacked without reason. |
| **npm / Payload** | Optional first-party plugins (**multi-tenant, MCP, ecommerce**) are **`PAYLOAD_* === 'true'`** — leaving them off avoids pulling their runtime paths (`src/plugins/env.ts`). Ecommerce enables **Stripe** client/server deps in code paths — keep off until needed. |
| **Storage** | Exactly **one** adapter per deploy: R2 (CF), or S3-compatible env, or Vercel Blob (`src/plugins/storage/config.ts`) — never two. |
| **Database** | Runtime uses **one** adapter (`src/lib/payloadDB.ts`): D1 on Workers, Postgres on Vercel Node, or MongoDB on Node — mutually exclusive by env. Multiple `@payloadcms/db-*` packages remain in `package.json` for **template / multi-target parity**, not to run together. |
| **Third-party SaaS** | Configure per product; see env reference and Payload Admin where applicable. |

---

## G. Related repo paths

| Path | Purpose |
|------|---------|
| `wrangler.jsonc` | Production Worker config |
| `config/wrangler.optional-bindings.jsonc` | Optional binding snippets |
| `config/cloudflare.bindings.json` | `cloudflare.bindings` for Deploy wizard help text (synced to `package.json`) |
| `config/cloudflare-env-reference.md` | Full env var catalog (human reference) |
| `scripts/sync-cloudflare-bindings.mjs` | Sync JSON → `package.json` |
| `src/lib/payloadDB.ts` | `resolvePayloadDB` — D1 / Postgres / MongoDB routing (throws if `D1` binding missing) |
| `src/plugins/storage/config.ts` | R2 vs S3 vs Vercel Blob |
| `src/lib/cloudflareImageLoader.ts` | Optional CF `/cdn-cgi/image/` pipeline for `next/image` |
| `next.config.js` | Sets `images.loader` when `NEXT_PUBLIC_CF_IMAGE_RESIZING=true` |
| `.cursor/rules/payload-deployment.mdc` | Payload + production docs hub |

Regenerate Cursor payload rules only when editing `scripts/generate-payload-cursor-rules.mjs`; this file is **human-maintained** alongside Wrangler.
