/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'
import Button from './button'
import Icon from './icon'

const playersBox = scale({
  float: 'right',
  marginTop: 2,
  fontSize: 20,
})

export default function Players({ props }) {
  const {
    darkmode,
    players,
    setDarkmode,
  } = props

  return (
    <div css={playersBox}>
      <Button props={{
        onClickFn: () => setDarkmode(!darkmode),
        darkmode,
        text: darkmode ? 'Lightmode' : 'Darkmode',
        icon: {
          name: darkmode ? 'sunny' : 'moon',
          size: 16
        }
      }} />
      <Button props={{
        darkmode,
        inactive: true,
        text: players
          ? `${players} Player${players > 1 ? 's' : ''}`
          : '? Players',
        icon: { name: 'people', size: 14 }
      }} />
    </div>
  )
}