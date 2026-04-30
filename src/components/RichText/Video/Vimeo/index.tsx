import React from 'react'

import classes from '../index.module.scss'

export const VimeoPlayer: React.FC<{
  videoId?: string
}> = ({ videoId }) => {
  return (
    <iframe
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      className={classes.iframe}
      frameBorder="0"
      src={`https://player.vimeo.com/video/${videoId}}`}
      title="Vimeo player"
    />
  )
}
