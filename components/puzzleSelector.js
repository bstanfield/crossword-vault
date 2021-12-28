/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale, colors, fonts } from '../lib/helpers'

export default function PuzzleSelector({ props }) {
  const {
    darkmode,
    socketConnection,
    dateRange
  } = props

  const selectStyles = (darkmode) => scale({
    display: 'inline-block',
    margin: 0,
    padding: 8,
    backgroundColor: darkmode ? colors.slate : colors.lightgrey,
    fontSize: 13,
    color: darkmode ? colors.lightgrey : colors.slate,
    borderRadius: 2,
    fontFamily: fonts.monospace,
    cursor: 'pointer',
    border: '1px solid transparent',
    '&:hover': {
      border: darkmode ? `1px solid ${colors.lightgrey}` : `1px solid ${colors.slate}`,
    },
    '-webkit-appearance': 'none',
    '-moz-appearance': 'none',
  })

  return (
    <select
      onChange={(event) => socketConnection.send({ type: 'newPuzzle', value: { dow: event.target.value, daily: false, dateRange } })}
      css={selectStyles(darkmode)}
      name="newPuzzle"
      id="newPuzzle"
    >
      <option value="" disabled selected>New puzzle ▼</option>
      <option value="Monday">Monday</option>
      <option value="Tuesday">Tuesday</option>
      <option value="Wednesday">Wednesday</option>
      <option value="Thursday">Thursday</option>
      <option value="Friday">Friday</option>
      <option value="Saturday">Saturday</option>
      <option value="Sunday">Sunday</option>
    </select>
  )
}