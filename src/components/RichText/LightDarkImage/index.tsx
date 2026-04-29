'use client'
import type { Media } from '@types'

import { usePopulateDocument } from '@root/hooks/usePopulateDocument'
import { useThemePreference } from '@root/providers/Theme/index'
import React from 'react'

import classes from './index.module.scss'

type Props = {
  alt: string
  caption?: string
  srcDark?: string
  srcDarkID?: number | string
  srcLight?: string
  srcLightID?: number | string
}

export const LightDarkImage: (props: Props) => null | React.JSX.Element = ({
  alt,
  caption,
  srcDark,
  srcDarkID,
  srcLight,
  srcLightID,
}) => {
  const { theme } = useThemePreference()
  const isDark = theme === 'dark'

  const directSrc = isDark ? srcDark : srcLight
  const mediaID = isDark ? srcDarkID : srcLightID

  const { data: media } = usePopulateDocument<Media>({
    id: mediaID,
    collection: 'media',
    enabled: !directSrc && !!mediaID,
  })

  const src = directSrc ?? media?.url

  if (!src) {
    return null
  }

  return (
    <div className={classes.imageWrap}>
      <img alt={alt} src={src} />
      {caption && <div className={classes.caption}>{caption}</div>}
    </div>
  )
}
