/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'
import Icon from './icon'

const playersBox = scale({
  float: 'right',
  marginTop: 16,
  fontSize: 20,
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
      <span css={button(darkmode)}>
        <strong>
          <span onClick={() => setDarkmode(darkmode ? false : true)}>{darkmode ? <span><Icon props={{ size: 18, name: 'sunny', color: '#eee' }} /> Lightmode</span> : <span><Icon props={{ size: 18, name: 'moon' }} /> Darkmode</span>}
          </span>
        </strong>
      </span>
      <Icon props={{ size: 21, name: 'people' }} /><strong>{players && countPlayers(players)} Guest{countPlayers(players) > 1 ? 's' : ''}</strong>
    </div>
  )
}