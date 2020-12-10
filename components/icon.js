/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'

const iconStyles = (size) => scale({
  fontSize: size || 'inherit',
  marginBottom: -2,
  'ion-icon': {
    marginBottom: -2,
    marginRight: 4,
  }
})

export default function Icon({ props }) {
  const {
    color,
    size,
    name,
  } = props

  const iconStyles = scale({
    color: color,
    fontSize: size || 'inherit',
    marginBottom: -2,
    'ion-icon': {
      marginBottom: -2,
      marginRight: 4,
    }
  })

  return (
    <span css={iconStyles}><ion-icon size="medium" name={name}></ion-icon></span>
  )
}