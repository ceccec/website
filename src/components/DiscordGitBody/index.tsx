import DOMPurify from 'isomorphic-dompurify'
import React from 'react'

import classes from './index.module.scss'

export const DiscordGitBody: React.FC<{ body?: string; platform?: 'Discord' | 'GitHub' }> = ({
  body,
  platform,
}) => {
  const html = DOMPurify.sanitize(body || '')
  return (
    <div
      className={[classes.body, platform && classes[platform]].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
