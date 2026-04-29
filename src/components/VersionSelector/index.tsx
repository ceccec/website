'use client'
import type { DocsVersion } from '@components/RenderDocs'

import { ChevronUpDownIcon } from '@root/icons/ChevronUpDownIcon/index'
import { useSitePublicConfigOptional } from '@root/providers/SitePublicConfig'
import { useRouter } from 'next/navigation'
import React from 'react'

import classes from './index.module.scss'

export const VersionSelector: React.FC<{
  initialVersion: DocsVersion
}> = ({ initialVersion }) => {
  const router = useRouter()
  const site = useSitePublicConfigOptional()
  const showBeta = site.enableBetaDocs
  const showLegacy = site.enableLegacyDocs

  return (
    <div className={classes.wrapper}>
      <select
        aria-label="Select Version"
        className={classes.select}
        defaultValue={initialVersion}
        onChange={(e) => {
          if (e.target.value === 'latest') {
            router.push('/docs')
          } else {
            router.push(`/docs/${e.target.value}`)
          }
        }}
      >
        <option
          className={[classes.option, classes.current].join(' ')}
          label="Version 3"
          value="latest"
        />
        {showBeta && (
          <option className={classes.option} label="Beta" value="beta" />
        )}
        {showLegacy && (
          <option
            className={[classes.option, classes.legacy].join(' ')}
            label="Version 2"
            value="v2"
          />
        )}
      </select>
      <ChevronUpDownIcon aria-hidden="true" className={classes.icon} />
    </div>
  )
}
