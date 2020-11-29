/** @jsx jsx */

import { jsx } from '@emotion/react'
import styles from '../styles/Home.module.css'
import classNames from 'classnames'
import { scale } from '../lib/helpers'
import { useEffect, useState } from 'react'


const blockNumber = scale({
  fontWeight: 400,
  fontSize: 10
});

const setBackgroundColor = (filled, highlightedSquares, content, focus, guestHighlights) => {
  if (focus === content.position) {
    return '#7cc9ff'
  }
  if (filled || highlightedSquares.includes(content.position)) {
    return 'rgba(255, 165, 0, 0.35)'
  }
  for (const [id, obj] of Object.entries(guestHighlights)) {
    const { color, squares } = obj
    if (squares.includes(content.position)) {
      return color
    }
  }
  // if (guestHighlights[content.position]) {
  //   return 'red'
  // }
  return 'white'
}

const squareInput = (content, filled, highlightedSquares, focus, guestHighlights) => scale({
  caretColor: 'transparent',
  outlineWidth: 0,
  border: 'none',
  width: '100%',
  height: '100%',
  padding: 0,
  margin: 0,
  textTransform: 'uppercase',
  textAlign: 'center',
  fontSize: '26px',
  lineHeight: 0,
  paddingTop: 1,
  fontWeight: 500,
  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
  backgroundColor: setBackgroundColor(filled, highlightedSquares, content, focus, guestHighlights),
  // transition: 'background-color 0.1s ease-in-out',
})

const squareBox = (filled, highlight) => scale({
  "margin": "0",
  "padding": "0",
  "marginLeft": "-2px",
  "marginBottom": "-2px",
  zIndex: (filled || highlight) ? 2 : 1,
  "color": "#333333",
  // transition: 'border 0.1s ease-in-out',
})

export default function Square({ props }) {
  const {
    content,
    hoveredClue,
    highlightedSquares,
    selectedSquare,
    movementDirection,
    filledInput,
    focus,
    guesses,
    uploadGuess,
    guestHighlights,
    setUploadGuess,
    setFocus,
    setMovementDirection,
    setSelectedSquare,
    setFilledInput,
    setBackspace,
    setGuesses,
    setEmptyInput
  } = props
  const [clickCount, setClickCount] = useState(0)
  const [highlight, setHighlight] = useState(false)
  const [inputData, setInputData] = useState('')
  const [selectionIterator, setSelectionIterator] = useState(0)

  const hover = content.number === Number(hoveredClue)

  // If user hovers over corresponding clue...
  useEffect(() => {
    if (hoveredClue && hover) {
      setSelectedSquare(content.position)
    }
  }, [hover])

  useEffect(() => {
    if (clickCount > 1) {
      setMovementDirection(movementDirection === 'across' ? 'down' : 'across')
    }
  }, [clickCount])

  useEffect(() => {
    if (highlightedSquares.includes(content.position)) {
      setHighlight(true)
    } else {
      setHighlight(false)
    }
  }, [highlightedSquares])

  // Responds to API responses
  useEffect(() => {
    if (guesses) {
      if (guesses[content.position - 1] !== inputData) {
        setInputData(guesses[content.position - 1])
      }
    }
  }, [guesses])

  const handleKeyDown = e => {
    if (e.key === ' ') {
      e.preventDefault();
    }

    if (e.key === 'Backspace') {
      // This is a dumb method. Just see if the box is empty. If it is, move back
      if (!inputData) {
        setBackspace(true)
      }
      setInputData('')
      setEmptyInput({ position: content.position, letter: '', iterator: 0 })
    }
  };

  return (
    <div id={content.position} css={squareBox(filledInput === content.position, highlight)} className={classNames(styles.crossword_board__square, content.letter === '.' ? styles.crossword_board__square__block : styles.crossword_board__square__letter)}>
      {content.number > 0 && <span css={blockNumber}>{content.number}</span>}
      {/* <span css={blockNumber(hover)}>{content.position - 1}</span> */}
      {content.letter !== '.' && <input
        onKeyDown={handleKeyDown}
        autoComplete='off'
        onFocus={() => {
          setFocus(content.position)
          setSelectedSquare(content.position)
        }}
        onBlur={() => { setClickCount(0) }}
        onClick={() => {
          setSelectedSquare(content.position)
          setClickCount(clickCount + 1)
        }}
        css={squareInput(content, filledInput === content.position, highlightedSquares, focus, guestHighlights)}
        type="text"
        id={`input-${content.position}`}
        value={inputData}
        onChange={(input) => {
          if (input.nativeEvent.data) {
            setInputData(input.nativeEvent.data)
            setSelectionIterator(selectionIterator + 1)
            setFilledInput({ position: content.position, letter: input.nativeEvent.data, iterator: selectionIterator })
            let newGuesses = guesses
            newGuesses[content.position - 1] = input.nativeEvent.data
            setGuesses(newGuesses)
            setUploadGuess(uploadGuess ? false : true)
          }
        }}
        name={content.letter} />}
    </div>
  )
}