# Config, bundlers & adapters

## Official docs

- [next.config.js](https://nextjs.org/docs/app/api-reference/config/next-config-js) — full option reference
- [Webpack](https://nextjs.org/docs/app/api-reference/config/next-config-js/webpack) · [Turbopack](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack)
- [TypeScript](https://nextjs.org/docs/app/api-reference/config/typescript) · [ESLint](https://nextjs.org/docs/app/api-reference/config/eslint)
- [CLI](https://nextjs.org/docs/app/api-reference/cli) · [`next dev/build/start`](https://nextjs.org/docs/app/api-reference/cli/next)
- [Adapters](https://nextjs.org/docs/app/api-reference/adapters) — custom deployment adapters (`adapterPath`)

## This repo

| Artifact | Role |
|----------|------|
| **`next.config.js`** | `withPayload`, `images`, **`webpack`** aliases (absolute) vs **`turbopack.resolveAlias`** (project-relative `./src/...`) |
| **`open-next.config.ts`** | `@opennextjs/cloudflare` — incremental cache, queue, tag cache |
| **`scripts/build.mjs`** | Target-specific pipeline — **`payload-deployment.mdc`** |

## Checklist

- [ ] Any new path alias added to **both** webpack and Turbopack blocks (see comment at top of **`next.config.js`**).
- [ ] `serverExternalPackages` / transpilation tuned if a Payload or native dep breaks RSC bundling ([next.config reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages)).
- [ ] OpenNext overrides match Worker bindings in **`wrangler.jsonc`**.

**More:** **`next-deployment.mdc`** · **`payload-deployment.mdc`**
