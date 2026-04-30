/**
 * Shared copy and URLs for cursor rule generators (`generate-*-cursor-rules.mjs`).
 * Keeps doc-discovery, LLM export, and regen footers in one place.
 */

export const DOC = {
  nextDocsLlmsTxt: 'https://nextjs.org/docs/llms.txt',
  nextSitemapXml: 'https://nextjs.org/sitemap.xml',
  payloadDocsLlmsTxt: 'https://payloadcms.com/docs/llms.txt',
  payloadSitemapXml: 'https://payloadcms.com/sitemap.xml',
}

function mdLink(label, href) {
  return `[${label}](${href})`
}

/** Hub “More” — first bullet in `next-features-overview.mdc` (align with `next-basics.mdc`). */
export function nextFeaturesOverviewBasicsBullet() {
  return `Basics → \`next-basics.mdc\` (always-on) — includes ${mdLink('`/docs/llms.txt`', DOC.nextDocsLlmsTxt)} vs ${mdLink('nextjs.org/sitemap.xml', DOC.nextSitemapXml)}`
}

/** Last bullet in `payload-features-overview.mdc` hub `moreLine` (align with `payload-basics.mdc`). */
export function payloadFeaturesOverviewBasicsBullet() {
  return `Basics → \`payload-basics.mdc\` (always-on) — official ${mdLink('`/docs/llms.txt`', DOC.payloadDocsLlmsTxt)} vs full-site ${mdLink('sitemap', DOC.payloadSitemapXml)}; repo: \`pnpm generate:llms\` → \`public/llms.txt\``
}

/** Shorter Basics line for deployment & ecosystem hubs. */
export const PAYLOAD_BASICS_HUB_SHORT = 'Basics → `payload-basics.mdc` (always-on)'

/** Paragraph inserted into generated `payload-deployment.mdc`. */
export const PAYLOAD_DEPLOYMENT_LLM_EXPORTS_LINE =
  '**LLM exports (`pnpm generate:llms`):** without `GITHUB_ACCESS_TOKEN`, `src/scripts/generateLLMs.ts` keeps committed `public/llms.txt` and `public/llms-full.txt` when present; set the token to refresh from GitHub.'

export const REGEN_FOOTER_NEXT =
  'Regenerate via `pnpm generate:cursor-rules:next` after editing `scripts/definitions/next-bodies/*.md`, `scripts/definitions/next-cursor-rules.manifest.json`, or the hub table in `scripts/generate-next-cursor-rules.mjs`.'

export const REGEN_FOOTER_PAYLOAD_FEATURES =
  'Regenerate this file via `pnpm generate:cursor-rules:payload` after editing `scripts/generate-payload-cursor-rules.mjs`.'

export const REGEN_FOOTER_PAYLOAD_SHORT =
  'Regenerate via `pnpm generate:cursor-rules:payload` after editing `scripts/generate-payload-cursor-rules.mjs`.'
