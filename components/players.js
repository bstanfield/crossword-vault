/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'

const playersBox = scale({
  float: 'right',
  marginTop: 16,
  fontSize: 20,
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
    return count - 1
  }

  return (
    <div css={playersBox}>
      <strong><span style={{ cursor: 'pointer' }} onClick={() => setDarkmode(darkmode ? false : true)}>{darkmode ? 'Daytime' : 'Nightime'}&nbsp;&nbsp;&nbsp;&nbsp;</span></strong>
      Other players: {players && countPlayers(players)}
    </div>
  )
}