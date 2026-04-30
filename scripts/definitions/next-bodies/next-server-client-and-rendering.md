# Server & client components / rendering

## Official docs

- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Streaming](https://nextjs.org/docs/app/guides/streaming)
- [Error handling](https://nextjs.org/docs/app/getting-started/error-handling)
- [Loading UI](https://nextjs.org/docs/app/api-reference/file-conventions/loading) · [`error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error) · [`not-found`](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [Rendering philosophy](https://nextjs.org/docs/app/guides/rendering-philosophy)

## Rules of thumb

| Use | When |
|-----|------|
| **Server Components (default)** | Data from `getPayload`, secrets, large dependencies, no browser APIs |
| **`'use client'`** | State, effects, event handlers, browser-only APIs |
| **Streaming / `loading.js`** | Slow I/O; show skeletons while RSC work continues |

- **Payload / DB access** belongs in **server** code paths; do not import `getPayload` into client bundles.
- **Composition:** pass **serializable** props from server to client; for CMS references, pass **IDs** or **already-fetched** plain objects — see **`payload-basics.mdc`** (relations / depth).

## Checklist

- [ ] Client boundaries are minimal — push `'use client'` to leaves.
- [ ] `Suspense` / `loading` align with streaming docs when UX requires progressive render.
- [ ] Errors: expected vs uncaught patterns per [Error handling](https://nextjs.org/docs/app/getting-started/error-handling).

**More:** **`next-data-fetching-and-actions.mdc`** · **`next-features-overview.mdc`**
