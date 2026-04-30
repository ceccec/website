/**
 * Stub Worker for `wrangler.payload-cli.jsonc` only (migrate / `wrangler d1` before OpenNext build).
 * Not deployed; real entry remains `.open-next/worker.js` in `wrangler.jsonc`.
 */
export default {
  fetch() {
    return new Response('Not used — Payload CLI / D1 tools only', { status: 404 })
  },
}
