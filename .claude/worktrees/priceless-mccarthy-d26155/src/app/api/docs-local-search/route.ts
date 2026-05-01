import { getDeploymentTarget } from '@root/plugins/payload-runtime/deploymentTarget'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/** Node-only: no Workers (no `child_process`) and no default Edge bundle. */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const rgCandidates = ['/usr/bin/rg', '/bin/rg']

function findRg(): null | string {
  for (const p of rgCandidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        return p
      }
    } catch {
      /* ignore */
    }
  }
  return null
}

function hasDisallowedControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i += 1) {
    const code = s.charCodeAt(i)
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
      return true
    }
  }
  return false
}

function localSearchAvailable(root: string | undefined): boolean {
  if (getDeploymentTarget() === 'cloudflare') {
    return false
  }
  const rg = findRg()
  if (!rg || !root?.trim()) {
    return false
  }
  try {
    const resolved = path.resolve(root.trim())
    return fs.existsSync(resolved)
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const qRaw = url.searchParams.get('q')
  const rootEnv = process.env.LOCAL_DOC_SEARCH_ROOT?.trim()

  if (qRaw === null || qRaw === '') {
    const enabled = localSearchAvailable(rootEnv)
    return Response.json({ enabled })
  }

  if (!localSearchAvailable(rootEnv)) {
    return Response.json({ enabled: false, results: [] })
  }

  const root = rootEnv!
  const q = qRaw.trim()
  if (q.length < 2) {
    return Response.json({ enabled: true, results: [] })
  }
  if (q.length > 120 || hasDisallowedControlChars(q)) {
    return Response.json({ error: 'invalid_query' }, { status: 400 })
  }

  const rg = findRg()!
  let resolvedRoot: string
  try {
    resolvedRoot = fs.realpathSync(path.resolve(root))
  } catch {
    return Response.json({ enabled: false, results: [] })
  }

  try {
    const { stdout } = await execFileAsync(
      rg,
      ['-l', '--glob', '*.md', '--glob', '*.mdx', '-m', '24', '-F', q, resolvedRoot],
      { maxBuffer: 4 * 1024 * 1024, timeout: 15_000, windowsHide: true },
    )

    const lines = stdout
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    const results = lines
      .map((absPath) => {
        try {
          const real = fs.realpathSync(absPath)
          const prefix = resolvedRoot.endsWith(path.sep) ? resolvedRoot : `${resolvedRoot}${path.sep}`
          if (real !== resolvedRoot && !real.startsWith(prefix)) {
            return null
          }
          return { path: path.relative(resolvedRoot, real) }
        } catch {
          return null
        }
      })
      .filter((x): x is { path: string } => x !== null)

    return Response.json({ enabled: true, results })
  } catch (e: unknown) {
    const err = e as { code?: number | string }
    if (err.code === 1) {
      return Response.json({ enabled: true, results: [] })
    }
    return Response.json({ enabled: true, error: 'search_failed', results: [] })
  }
}
