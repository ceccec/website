'use client'

import { isNumber } from '@root/utilities/isNumber'
import React from 'react'

import classes from './index.module.scss'

export const DiscordUsersPill: React.FC<{ className?: string }> = ({ className }) => {
  const [discordOnlineUserCount, setDiscordOnlineUserCount] = React.useState<string>()

  React.useEffect(() => {
    const fetchDiscordElement = async () => {
      const res = await fetch(
        'https://img.shields.io/discord/967097582721572934?label=Discord&color=5865F2&style=flat-square',
      )
      const svg = await res.text()
      const titleMatch = svg.match(/<title[^>]*>([^<]*)<\/title>/i)
      const titleText = titleMatch?.[1] ?? ''
      const onlineUsers = titleText.match(/\d+(?:\.\d+)?k?/i)?.[0]
      setDiscordOnlineUserCount(onlineUsers)
    }

    void fetchDiscordElement()
  }, [])

  return (
    <div className={[classes.pill, className].filter(Boolean).join(' ')}>
      <p className={classes.leftPill}>Discord</p>
      <p className={classes.userCount}>{discordOnlineUserCount} online</p>
    </div>
  )
}
