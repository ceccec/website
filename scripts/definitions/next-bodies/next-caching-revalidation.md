# Caching & revalidation

## Official docs

| Topic | Link |
|-------|------|
| Caching overview | [Caching](https://nextjs.org/docs/app/getting-started/caching) |
| Revalidating | [Revalidating](https://nextjs.org/docs/app/getting-started/revalidating) |
| Deep dive | [How revalidation works](https://nextjs.org/docs/app/guides/how-revalidation-works) |
| Previous model (no Cache Components) | [Caching (previous model)](https://nextjs.org/docs/app/guides/caching-without-cache-components) |
| `unstable_cache` | [Function](https://nextjs.org/docs/app/api-reference/functions/unstable_cache) |
| `revalidateTag` / `revalidatePath` | [revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag), [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) |
| `cacheTag` / `cacheLife` | [cacheTag](https://nextjs.org/docs/app/api-reference/functions/cacheTag), [cacheLife](https://nextjs.org/docs/app/api-reference/functions/cacheLife) |
| Directives | [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) family |

## This repo

- **OpenNext on Cloudflare:** `open-next.config.ts` wires **R2** incremental cache, **DO** queue, **D1** tag cache — see [OpenNext Cloudflare caching](https://opennext.js.org/cloudflare/caching) and **`payload-deployment.mdc`**.
- **Payload content changes** should drive invalidation consistent with **webhooks** or jobs — align with **`payload-preview-drafts.mdc`** / deployment docs.
- **Tag-based** revalidation must match tags used in `fetch` / `unstable_cache` / `cacheTag` in your routes.

## Checklist

- [ ] Tags and paths are intentional and documented for operators.
- [ ] Multi-instance / edge cache behavior understood for your host ([how revalidation works](https://nextjs.org/docs/app/guides/how-revalidation-works)).
- [ ] No stale public content after CMS publish without a matching invalidation path.

**More:** **`next-deployment.mdc`** · **`payload-deployment.mdc`**
