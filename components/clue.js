/** @jsx jsx */

import { jsx } from '@emotion/react'
import styles from '../styles/Home.module.css'
import classNames from 'classnames'
import { scale } from '../lib/helpers'
import { useEffect, useState } from 'react'

const clueStyle = (highlight) => scale({
  backgroundColor: highlight && 'orange',
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
    <li css={clueStyle(highlight)} onMouseLeave={() => setHoveredClue(false)} onMouseEnter={() => { setMovementDirection(direction); setHoveredClue(Number(clue.split('.')[0])) }} key={index} id={index}><strong>{clue.split('.')[0]}.</strong> {clue.split('.')[1]}</li>
  )
}