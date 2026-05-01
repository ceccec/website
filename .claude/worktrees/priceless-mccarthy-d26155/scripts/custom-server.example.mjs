#!/usr/bin/env node
/**
 * Reference only — not wired into `pnpm dev` or production.
 * Shows the `examples/custom-server` pattern: Payload on a plain Node HTTP server.
 *
 * For this repo, the supported stack is Next.js App Router + `@payloadcms/next` (`next dev` / OpenNext).
 *
 * @see https://github.com/payloadcms/payload/tree/main/examples/custom-server
 *
 * Example sketch (install `express` yourself if you experiment):
 *
 *   import express from 'express'
 *   import payload from 'payload'
 *   import config from './payload.config.js'
 *
 *   const app = express()
 *   await payload.init({ config, express: app })
 *   app.listen(3000)
 */

console.error(
  '[custom-server.example] This file is documentation. Use `pnpm dev` (Next + Payload) for this project.',
)
process.exitCode = 0
