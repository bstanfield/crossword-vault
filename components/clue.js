/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'
import { useEffect, useState } from 'react'

const clueStyle = (darkmode, highlight) => scale({
  color: darkmode ? '#f5f5f5' : '#333333',
  backgroundColor: highlight ? darkmode ? '#5c5cff' : 'rgba(255, 165, 0, 0.35)' : '',
  padding: '5px 10px',
  border: highlight ? darkmode ? '2px solid #5c5cff' : '2px solid rgba(255, 165, 0, 1)' : '2px solid transparent',
  borderRadius: 4,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  transitionProperty: 'background-color, border',
  fontSize: [14, 14, 14, 'inherit'],
});

export default function Clue({ props }) {
  const {
    darkmode,
    index,
    clue,
    clueIndex,
    direction,
    lockout,
    movementDirection,
    setNewFocus,
    setLockout,
    setMovementDirection,
    setHoveredClue
  } = props
  const [highlight, setHighlight] = useState(false)

  const hoverClue = () => {
    if (lockout) {
      if (Date.now() - lockout > 500) {
        // Existing lockout more than 0.5s ago
        setMovementDirection(direction)
        setHoveredClue(Number(clue.split('.')[0]))
      } else {
        // Locked out!
      }
    } else {
      // No existing lockout
      setMovementDirection(direction)
      setHoveredClue(Number(clue.split('.')[0]))
    }
  }

  useEffect(() => {
    if (index === clueIndex) {
      if (direction === movementDirection) {
        // Checks to see if clue direction matches user direction
        setHighlight(true)
      } else {
        setHighlight(false)
      }
    } else {
      setHighlight(false)
    }

    // TODO: If focus isn't on current clue, then remove focus
    // setFocus(false)
  }, [clueIndex, movementDirection])

  return (
    <li
      css={clueStyle(darkmode, highlight)}
      onClick={() => {
        setNewFocus(index)
        setLockout(Date.now())
      }}
      onMouseLeave={() => setHoveredClue(false)}
      onMouseEnter={() => hoverClue()}
      id={`${index}-${direction}`}
    >
      <strong>{clue.split('.')[0]}.</strong> <span dangerouslySetInnerHTML={{ __html: clue.substring(clue.indexOf('.') + 1) }} />
    </li>
  )
}