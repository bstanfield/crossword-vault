/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'
import { useEffect, useState } from 'react'

const alertStyles = () => scale({
  display: 'inline-block',
  margin: 0,
  padding: 8,
  backgroundColor: 'red',
  fontSize: 13,
  color: '#f5f5f5',
  fontFamily: 'monospace',
  borderRadius: 2,
  fontFamily: 'JetBrains Mono, monospace'
})

export default function Alert({ props }) {
  const {
    grading,
    guesses,
  } = props
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (guesses) {
      if (grading.correct === 225 - grading.black) {
        return
      }
      if (grading.correct + grading.incorrect === guesses.length - grading.black) {
        setShowAlert(true)
      }
    }
  }, [grading])


  if (showAlert) {
    return (
      <p css={alertStyles}><strong>{grading.incorrect}</strong> incorrect</p>
    )
  } else {
    return null
  }


}