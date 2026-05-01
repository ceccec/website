# Routing & layouts

## Official docs

- **Overview path:** [Getting Started](https://nextjs.org/docs/app/getting-started) → Project structure, Layouts and pages, Linking and navigating.
- **Deep reference:** [File-system conventions](https://nextjs.org/docs/app/api-reference/file-conventions) — `layout`, `page`, `loading`, `error`, `not-found`, `template`, `default`, route groups, dynamic segments, parallel routes, intercepting routes.

## Concepts

| Topic | Link |
|-------|------|
| Project layout | [Project structure](https://nextjs.org/docs/app/getting-started/project-structure), [`src` directory](https://nextjs.org/docs/app/api-reference/file-conventions/src-folder) |
| Layouts & nesting | [Layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) |
| Client navigation | [Linking and navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating), [prefetching](https://nextjs.org/docs/app/guides/prefetching) |
| Dynamic routes | [Dynamic route segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) |
| Route groups | [Route groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) |
| Advanced | [Parallel routes](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes), [Intercepting routes](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes) |
| Segment config | [Route segment config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) (`dynamic`, `runtime`, `revalidate`, …) |

## This repo

- App routes live under **`src/app`** (see **`next-basics.mdc`**).
- **Payload** owns slugs and redirects for CMS-driven URLs — prefer Payload redirects / collections over ad hoc Next rewrites when content should drive the URL.

## Checklist

- [ ] `layout` / `page` boundaries match data-loading and cache intent (pair with **`next-caching-revalidation.mdc`**).
- [ ] Dynamic params use `generateStaticParams` when pre-rendering many paths ([API](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)).
- [ ] `error.js` / `not-found` match product expectations ([Error handling](https://nextjs.org/docs/app/getting-started/error-handling)).

**More:** **`next-features-overview.mdc`** · Server vs client → **`next-server-client-and-rendering.mdc`**
