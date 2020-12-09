/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'
import { useEffect, useState } from 'react'

const alertStyles = (status) => scale({
  display: 'inline-block',
  margin: 0,
  padding: 8,
  backgroundColor: status === 'correct' ? 'green' : 'red',
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
  const [status, setStatus] = useState('incorrect')
  const [text, setText] = useState(false)

  useEffect(() => {
    if (guesses) {
      // Success!
      if (grading.correct === 225 - grading.black) {
        setStatus('correct')
        setText('Crossword solved!')
        return
      }
      // Incorrect answers
      if (grading.correct + grading.incorrect === guesses.length - grading.black) {
        setShowAlert(true)
        setText(`${grading.incorrect} incorrect.`)
        return
      }
    }
  }, [grading])


  if (text) {
    return (
      <p css={alertStyles(status)}>{text}</p>
    )
  } else {
    return null
  }


}