'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useState } from 'react'
import { toast } from 'sonner'

import './index.scss'

const baseClass = 'seed-button'

/**
 * Admin action that POSTs to the `/api/seed` endpoint. Because the endpoint runs the seed inside a
 * request, the seeded collections/globals revalidate the page cache — the home page appears on the
 * frontend immediately (no server restart). Idempotent: safe to click repeatedly.
 */
const SeedButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const {
    config: {
      routes: { api },
    },
  } = useConfig()

  const seed = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${api}/seed`, { credentials: 'include', method: 'POST' })
      const data = (await res.json()) as { error?: string; messages?: string[]; ok?: boolean }
      if (res.ok && data.ok) {
        toast.success(`Seeded demo content — ${data.messages?.length ?? 0} steps`, {
          duration: 4000,
        })
      } else {
        toast.error(data.error || 'Seed failed', { duration: 4000 })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Seed failed', { duration: 4000 })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button className={baseClass} disabled={isLoading} onClick={seed} type="button">
      {isLoading ? 'Seeding…' : 'Seed Demo Content'}
    </button>
  )
}

export default SeedButton
