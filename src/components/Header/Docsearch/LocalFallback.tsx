'use client'

import Link from 'next/link'
import React from 'react'

import classes from './localFallback.module.scss'

/**
 * When Algolia DocSearch keys are unset: optional local search (Node + ripgrep + LOCAL_DOC_SEARCH_ROOT)
 * or a plain Docs link. Cloudflare Workers and hosts without `rg` return enabled:false — see API route.
 */
export const LocalFallback: React.FC = () => {
  const showLocalSearch = process.env.NEXT_PUBLIC_LOCAL_DOC_SEARCH === '1'
  const [enabled, setEnabled] = React.useState(false)
  const [checked, setChecked] = React.useState(false)
  const [q, setQ] = React.useState('')
  const [results, setResults] = React.useState<{ path: string }[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!showLocalSearch) {
      setChecked(true)
      return
    }
    let cancelled = false
    void fetch('/api/docs-local-search', { cache: 'no-store' })
      .then(async (r) => r.json())
      .then((data: { enabled?: boolean }) => {
        if (!cancelled) {
          setEnabled(Boolean(data.enabled))
          setChecked(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setChecked(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [showLocalSearch])

  React.useEffect(() => {
    if (!enabled || q.trim().length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(() => {
      setLoading(true)
      void fetch(`/api/docs-local-search?q=${encodeURIComponent(q.trim())}`, { cache: 'no-store' })
        .then(async (r) => r.json())
        .then((data: { results?: { path: string }[] }) => setResults(data.results ?? []))
        .finally(() => setLoading(false))
    }, 280)
    return () => clearTimeout(t)
  }, [q, enabled])

  return (
    <div className={classes.wrap}>
      {checked && enabled ? (
        <>
          <input
            aria-label="Search documentation (local index)"
            autoComplete="off"
            className={classes.input}
            id="header-local-doc-search"
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search docs…"
            type="search"
            value={q}
          />
          {loading ? <span className={classes.meta}>Searching…</span> : null}
          {results.length > 0 ? (
            <ul className={classes.results}>
              {results.map((r) => (
                <li key={r.path}>
                  <span className={classes.resultPath}>{r.path}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
      <Link className={classes.docsLink} href="/docs">
        Documentation
      </Link>
    </div>
  )
}
