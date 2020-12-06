/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'

const playersBox = scale({
  float: 'right',
  marginTop: 16,
  fontSize: 20,
})

const icon = (size) => scale({
  fontSize: size || 'inherit',
  marginBottom: -2,
  'ion-icon': {
    marginBottom: -2,
    marginRight: 4,
  }
})

const button = (darkmode) => scale({
  margin: '0 16px',
  padding: '4px 12px',
  borderRadius: 4,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: darkmode ? '#333' : '#dcdcdc',
  }
})

export default function Players({ props }) {
  const {
    darkmode,
    players,
    setDarkmode,
  } = props

  const countPlayers = (players) => {
    let count = 0
    for (const [id, color] of Object.entries(players)) {
      count++
    }
    return count
  }

  return (
    <div css={playersBox}>
      <span css={button(darkmode)}><strong><span onClick={() => setDarkmode(darkmode ? false : true)}>{darkmode ? <span css={icon}><ion-icon name="sunny"></ion-icon> Daymode</span> : <span css={icon}><ion-icon name="moon"></ion-icon> Nightmode</span>}</span></strong></span>
      <span css={icon(23)}><ion-icon size="medium" name="people"></ion-icon></span>{players && countPlayers(players)} Guest{countPlayers(players) > 1 ? 's' : ''}
    </div>
  )
}