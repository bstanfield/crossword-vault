/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'
import { useEffect, useState } from 'react'
import Icon from './icon'

const buttonStyles = scale({
  display: 'inline-block',
  margin: 0,
  padding: 8,
  backgroundColor: '#eeeeee',
  fontSize: 13,
  color: '#333333',
  fontFamily: 'monospace',
  borderRadius: 2,
  fontFamily: 'JetBrains Mono, monospace',
  cursor: 'pointer',
  border: '1px solid transparent',
  '&:hover': {
    border: '1px solid #333333',
  }
})

export default function Button({ props }) {
  const {
    text,
    icon,
  } = props
  const [status, setStatus] = useState('incorrect')

  return (
    <p css={buttonStyles}>{icon && <Icon props={{ name: icon.name, size: icon.size }} />}{text}</p>
  )


}