/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'
import Button from './button'
import Icon from './icon'

const playersBox = scale({
  float: 'right',
  marginTop: 2,
  fontSize: 20,
  p: {
    marginLeft: 12
  }
})

export default function Players({ props }) {
  const {
    darkmode,
    players,
    setDarkmode,
    socketConnection
  } = props

  return (
    <div css={playersBox}>

      <Button props={{
        onClickFn: () => socketConnection.send({ type: 'newPuzzle', value: { dow: null, daily: true } }),
        darkmode,
        text: "Today's Puzzle!",
        icon: {
          name: 'star',
          size: 14
        },
        backgroundColor: '#ffa500',
      }} />
      <Button props={{
        onClickFn: () => setDarkmode(!darkmode),
        darkmode,
        text: darkmode ? 'Light' : 'Dark',
        icon: {
          name: darkmode ? 'sunny' : 'moon',
          size: 13
        }
      }} />
      <Button props={{
        darkmode,
        inactive: true,
        text: players,
        icon: { name: 'people', size: 14 }
      }} />
    </div>
  )
}