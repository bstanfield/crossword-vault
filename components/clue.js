/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'
import { useEffect, useState } from 'react'

const clueStyle = (highlight) => scale({
  backgroundColor: highlight && 'rgba(255, 165, 0, 0.35)',
  padding: '5px 10px',
  border: highlight ? '2px solid rgba(255, 165, 0, 1)' : '2px solid transparent',
  borderRadius: 4,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  transitionProperty: 'background-color, border'
});

export default function Clue({ props }) {
  const {
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
      css={clueStyle(highlight)}
      onClick={() => {
        setNewFocus(index)
        setLockout(Date.now())
      }}
      onMouseLeave={() => setHoveredClue(false)}
      onMouseEnter={() => hoverClue()}
      id={`${index}-${direction}`}
    >
      <strong>{clue.split('.')[0]}.</strong> {clue.substring(clue.indexOf('.') + 1)}
    </li>
  )
}