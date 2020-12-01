/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'

const playersBox = scale({
  position: 'absolute',
  top: 32,
  right: 42,
  fontSize: 20,
})

export default function Players({ props }) {
  const {
    players
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
      Other players: {players && countPlayers(players)}
    </div>
  )
}