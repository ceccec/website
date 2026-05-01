'use client'

import { Button, TextInput, toast, useConfig } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

function globalDocFromResponse(body: unknown): null | Record<string, unknown> {
  if (!body || typeof body !== 'object') {
    return null
  }
  const b = body as Record<string, unknown>
  if (b.result && typeof b.result === 'object' && b.result !== null && !Array.isArray(b.result)) {
    return b.result as Record<string, unknown>
  }
  if (b.doc && typeof b.doc === 'object' && b.doc !== null && !Array.isArray(b.doc)) {
    return b.doc as Record<string, unknown>
  }
  return b
}

const BeforeDashboard: React.FC = () => {
  const [isLoadingLatest, setIsLoadingLatest] = useState(false)
  const [isLoadingSpecific, setIsLoadingSpecific] = useState(false)
  const [version, setVersion] = useState('')
  const [dashboardNotice, setDashboardNotice] = useState<null | string>(null)

  const {
    config: {
      routes: { api },
    },
  } = useConfig()

  useEffect(() => {
    let cancelled = false
    void fetch(`${api}/globals/admin-settings`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (cancelled || !body) {
          return
        }
        const doc = globalDocFromResponse(body)
        if (
          doc?.showDashboardNotice &&
          typeof doc.dashboardNotice === 'string' &&
          doc.dashboardNotice.trim()
        ) {
          setDashboardNotice(doc.dashboardNotice.trim())
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [api])

  const createPost = (versionOverride?: string) => {
    const isSpecific = Boolean(versionOverride)
    if (isSpecific) {
      setIsLoadingSpecific(true)
    } else {
      setIsLoadingLatest(true)
    }

    const promise = fetch(`${api}/create-release-post-from-admin`, {
      body: JSON.stringify(versionOverride ? { version: versionOverride } : {}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to create release post')
      }
    })

    void toast.promise(promise, {
      error: (err: Error) => err.message,
      loading: 'Creating draft release post...',
      success: 'Draft release post created',
    })

    void promise.finally(() => {
      if (isSpecific) {
        setIsLoadingSpecific(false)
      } else {
        setIsLoadingLatest(false)
      }
    })
  }

  return (
    <div className={baseClass}>
      {dashboardNotice ? (
        <div
          className={`${baseClass}__notice`}
          style={{
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            whiteSpace: 'pre-wrap',
          }}
        >
          {dashboardNotice}
        </div>
      ) : null}
      <h2 className={`${baseClass}__heading`}>Payload Release Notes</h2>
      <h4>
        Use this component to sync Payload release notes to a draft blog post assigned to the
        Release Notes category.
      </h4>
      <div className={`${baseClass}__actions`}>
        <Button
          buttonStyle="secondary"
          disabled={isLoadingLatest}
          onClick={() => createPost()}
          size="large"
        >
          Pull Latest Release
        </Button>
        <div className={`${baseClass}__specific`}>
          <TextInput
            onChange={(e) => setVersion((e as React.ChangeEvent<HTMLInputElement>).target.value)}
            path="version"
            placeholder="e.g. 3.1.0"
            value={version}
          />
          <Button
            buttonStyle="secondary"
            disabled={isLoadingSpecific || !version.trim()}
            onClick={() => createPost(version.trim())}
            size="large"
          >
            Pull Specific Release
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BeforeDashboard
