/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale, colors, fonts } from '../lib/helpers'

export default function DateSelector({ props }) {
  const {
    darkmode,
    setDateRange,
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
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  })

  return (
    <select
      onChange={(event) => setDateRange(event.target.value)}
      css={selectStyles(darkmode)}
      name="newPuzzle"
      id="newPuzzle"
      defaultValue={'Range ▼'}
    >
      <option disabled value="Range ▼">{dateRange || 'Range ▼'}</option>
      <option value="All">All</option>
      <option value="2005+">2005+</option>
      <option value="2010+">2010+</option>
      <option value="2015+">2015+</option>
      <option value="2021">2021</option>
    </select>
  )
}