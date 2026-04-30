# Directives & runtime APIs

## Directives

| Directive | Doc |
|-----------|-----|
| `use client` | [use client](https://nextjs.org/docs/app/api-reference/directives/use-client) |
| `use server` | [use server](https://nextjs.org/docs/app/api-reference/directives/use-server) |
| `use cache` | [use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache), [private](https://nextjs.org/docs/app/api-reference/directives/use-cache-private), [remote](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote) |

## Server-only helpers

| API | Doc |
|-----|-----|
| `cookies` | [cookies](https://nextjs.org/docs/app/api-reference/functions/cookies) |
| `headers` | [headers](https://nextjs.org/docs/app/api-reference/functions/headers) |
| `draftMode` | [draftMode](https://nextjs.org/docs/app/api-reference/functions/draft-mode) |
| `redirect` / `permanentRedirect` | [redirect](https://nextjs.org/docs/app/api-reference/functions/redirect) |
| `notFound` | [notFound](https://nextjs.org/docs/app/api-reference/functions/not-found) |
| `forbidden` / `unauthorized` | [forbidden](https://nextjs.org/docs/app/api-reference/functions/forbidden), [unauthorized](https://nextjs.org/docs/app/api-reference/functions/unauthorized) |
| `connection` | [connection](https://nextjs.org/docs/app/api-reference/functions/connection) |

## Client navigation

[`useRouter`](https://nextjs.org/docs/app/api-reference/functions/use-router), [`usePathname`](https://nextjs.org/docs/app/api-reference/functions/use-pathname), [`useSearchParams`](https://nextjs.org/docs/app/api-reference/functions/use-search-params), [`useParams`](https://nextjs.org/docs/app/api-reference/functions/use-params), [`useLinkStatus`](https://nextjs.org/docs/app/api-reference/functions/use-link-status)

## This repo

- **`draftMode`** pairs with CMS preview — **`payload-preview-drafts.mdc`** and **`next-guides-index.mdc`** (Draft Mode guide).
- Prefer **server** `redirect` / `notFound` in RSC when appropriate vs client navigation.

## Checklist

- [ ] Directives placed at file top per docs; **server** modules never imported into **client** bundles unless safe.
- [ ] Dynamic APIs (`cookies`, `headers`, …) usage consistent with static vs dynamic rendering ([dynamic rendering](https://nextjs.org/docs/app/guides/rendering-philosophy)).

**More:** **`next-server-client-and-rendering.mdc`** · **`next-caching-revalidation.mdc`**
