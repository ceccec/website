/**
 * How to type optional Wrangler bindings:
 *
 * 1. Merge snippets into wrangler.jsonc (see config/wrangler.optional-bindings.jsonc).
 * 2. Edit `cloudflare-env.overrides.d.ts` (committed stub) — `declare namespace Cloudflare { interface Env { … } }`.
 * 3. Run `pnpm run cf-typegen`; merge with manual types if needed.
 *
 * This file is documentation-only; the real merge target is `cloudflare-env.overrides.d.ts`.
 */
export {}
