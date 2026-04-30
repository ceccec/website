/**
 * Production HTTP server for Next.js + Payload over a Unix domain socket (no TCP listen).
 * Used by `Dockerfile` / `docker-compose.yml` with Nginx `proxy_pass` to the same socket path.
 *
 * Env: `LISTEN_UNIX_SOCKET` (default `/run/payload/next.sock`), `NODE_ENV=production`.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import next from 'next'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

const socketPath = (process.env.LISTEN_UNIX_SOCKET || '/run/payload/next.sock').trim()
const dev = process.env.NODE_ENV !== 'production'

// Do not pass `process.env.HOSTNAME` — Docker sets it to the container Id.
const app = next({ dev, dir: projectRoot })
const handle = app.getRequestHandler()

await app.prepare()

function safeUnlinkSync(p) {
  try {
    fs.unlinkSync(p)
  } catch (e) {
    if (e && typeof e === 'object' && 'code' in e && e.code !== 'ENOENT') {
      throw e
    }
  }
}

safeUnlinkSync(socketPath)

const server = http.createServer((req, res) => handle(req, res))

function shutdown() {
  server.close(() => {
    safeUnlinkSync(socketPath)
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

server.on('error', (err) => {
  console.error('[next-start-unix]', err)
  process.exit(1)
})

server.listen(socketPath, () => {
  try {
    fs.chmodSync(socketPath, 0o666)
  } catch {
    // non-fatal — nginx must be able to connect (see docker-compose volume + comments)
  }
  console.log(`[next-start-unix] listening on unix:${socketPath}`)
})
