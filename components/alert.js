/** @jsx jsx */

import { jsx } from '@emotion/react'
import { colors, fonts, scale } from '../lib/helpers'
import { useEffect, useState } from 'react'

const alertStyles = (status) => scale({
  cursor: 'pointer',
  display: 'inline-block',
  margin: 0,
  padding: 8,
  marginRight: 6,
  backgroundColor: status === 'correct' ? colors.success : colors.error,
  fontSize: 13,
  color: colors.offwhite,
  borderRadius: 2,
  fontFamily: fonts.monospace,
})

export default function Alert({ props }) {
  const {
    grading,
    guesses,
    showIncorrect,
    setShowIncorrect,
  } = props
  const [status, setStatus] = useState('incorrect')
  const [text, setText] = useState(false)

  useEffect(() => {
    if (guesses) {
      // Success!
      if (grading.correct === 225 - grading.black) {
        setStatus('correct')
        return setText('Crossword solved!')
      }
      // Incorrect answers
      if (grading.correct + grading.incorrect === guesses.length - grading.black) {
        setStatus('incorrect')
        return setText(`${grading.incorrect} wrong`)
      }

      // Do not show
      setText(false)
    }
  }, [grading])


  if (text) {
    return (
      <p onClick={() => setShowIncorrect(!showIncorrect)} css={alertStyles(status)}>{text} {status === 'incorrect' && (showIncorrect ? '(hide)' : '(show)')}</p>
    )
  } else {
    return null
  }
}