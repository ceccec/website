'use client'

import type { DefaultCellComponentProps, UIFieldClient } from 'payload'
import type { ReactNode } from 'react'

import { truncateUuidForDisplay } from '@root/utilities/truncateUuidForDisplay'

/**
 * List column: compact Id for scanning; row links / edit routes still use full `rowData.id`.
 */
export function ShortIdCell(props: DefaultCellComponentProps<UIFieldClient>): ReactNode {
  const raw = props.rowData?.id
  if (raw == null || raw === '') {
    return null
  }
  const shown = truncateUuidForDisplay(raw)
  if (!shown) {
    return null
  }
  const full = String(raw)
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }} title={full}>
      {shown}
    </span>
  )
}
