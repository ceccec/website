/**
 * Parse `wrangler.jsonc`. `.jsonc` permits both comments and trailing commas; `strip-json-comments`
 * removes only comments, so we also strip trailing commas (a `,` right before `}`/`]`) before
 * JSON.parse — otherwise a config like `"binding": "ASSETS",\n}` throws "Expected double-quoted
 * property name".
 */
import fs from 'node:fs'
import path from 'node:path'

import stripJsonComments from 'strip-json-comments'

/** @returns {Record<string, unknown>} */
export function readWranglerConfig(cwd = process.cwd()) {
  const p = path.join(cwd, 'wrangler.jsonc')
  const text = fs.readFileSync(p, 'utf8')
  const json = stripJsonComments(text).replace(/,(\s*[}\]])/g, '$1')
  return JSON.parse(json)
}

/**
 * @param {Record<string, unknown>} [config]
 * @returns {{ payload: string, tagCache: string }}
 */
export function wranglerD1DatabaseIds(config = readWranglerConfig()) {
  const rows = /** @type {Array<{ binding?: string, database_id?: string }>} */ (
    config.d1_databases ?? []
  )
  let payload = ''
  let tagCache = ''
  for (const row of rows) {
    const id = typeof row.database_id === 'string' ? row.database_id.trim() : ''
    if (row.binding === 'D1') {payload = id}
    if (row.binding === 'NEXT_TAG_CACHE_D1') {tagCache = id}
  }
  return { payload, tagCache }
}
