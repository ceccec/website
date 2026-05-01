import React from 'react'

import './index.scss'

interface ArrowProps {
  direction: 'down' | 'left' | 'right' | 'up'
}

const arrowIcons = {
  down: '↓',
  left: '←',
  right: '→',
  up: '↑',
}

export const Arrow: React.FC<ArrowProps> = ({ direction }) => {
  return <div className={`docs-arrow docs-arrow--${direction}`}>{arrowIcons[direction]}</div>
}
