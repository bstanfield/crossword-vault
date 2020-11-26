/** @jsx jsx */

import { jsx } from '@emotion/react'
import styles from '../styles/Home.module.css'
import classNames from 'classnames'
import { scale } from '../lib/helpers'
import { useEffect, useState } from 'react'

const clueStyle = (highlight) => scale({
  backgroundColor: highlight && 'rgba(255, 165, 0, 0.35)',
  padding: '5px 10px',
  border: highlight ? '2px solid rgba(255, 165, 0, 1)' : '2px solid transparent',
  borderRadius: 4,
  transition: 'all 0.2s ease',
  transitionProperty: 'background-color, border'
});

export default function Clue({ props }) {
  const {
    index,
    clue,
    clueIndex,
    direction,
    movementDirection,
    setMovementDirection,
    setHoveredClue
  } = props
  const [highlight, setHighlight] = useState(false)

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
  }, [clueIndex, movementDirection])

  return (
    <li css={clueStyle(highlight)} onMouseLeave={() => setHoveredClue(false)} onMouseEnter={() => { setMovementDirection(direction); setHoveredClue(Number(clue.split('.')[0])) }} id={`${index}-${direction}`}><strong>{clue.split('.')[0]}.</strong> {clue.substring(clue.indexOf('.') + 1)}</li>
  )
}