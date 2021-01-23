/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale, colors, fonts } from '../lib/helpers'
import { useEffect, useState } from 'react'
import Nametag from './nametag'

// Only have matching dark colors for red
const colorLookup = {
  'transparent': {
    high: 'transparent',
    low: 'transparent',
    dark_high: 'transparent',
    dark_low: 'transparent',
  },
  'grey': {
    high: colors.slate,
    low: colors.lightgrey,
    dark_high: colors.slate,
    dark_low: colors.lightgrey,
  },
  'red': {
    high: 'rgb(255, 40, 101)',
    low: '#E7D6DB',
    dark_high: 'rgb(70, 17, 32)',
    dark_low: '#635156'
  },
  'purple': {
    high: 'rgb(161, 59, 224)',
    low: '#DDD1E4',
    dark_high: '#332d4a',
    dark_low: '#5c5577'
  },
  'blue': {
    high: 'rgb(40, 203, 255)',
    low: '#CFE2E8',
    dark_high: 'rgb(70, 17, 32)',
    dark_low: '#635156'
  }
}

const blockNumber = scale({
  fontWeight: 400,
  fontSize: 8,
  top: '1px !important',
});

const setBackgroundColor = (darkmode, filled, highlightedSquares, content, focus, guestHighlight, showIncorrect, inputData) => {
  if (focus === content.position) {
    // Maybe replace with: #ffa600
    return darkmode ? '#5c5cff' : '#7cc9ff'
  }
  if (filled || highlightedSquares.includes(content.position)) {
    return darkmode ? '#885c88' : '#f5c46c'
  }
  if (guestHighlight) {
    return darkmode ? guestHighlight.color.dark_low : guestHighlight.color.low
  }
  if (showIncorrect && inputData && content.letter !== inputData.toUpperCase()) {
    return darkmode ? '#555563' : '#ffcfcf'
  }
  return darkmode ? '#555563' : '#f5f5f5'
}

const setBorderColor = (darkmode, filled, highlightedSquares, content, focus, guestHighlight, showIncorrect, inputData) => {
  // z index is bad
  if (showIncorrect && inputData && content.letter !== inputData.toUpperCase()) {
    return `2px solid ${colors.error}`
  }
  if (focus === content.position) {
    return '2px solid black'
  }
  if (filled || highlightedSquares.includes(content.position)) {
    return '2px solid black'
  }
  if (guestHighlight) {
    return `2px solid ${darkmode ? guestHighlight.color.dark_high : guestHighlight.color.high}`
  }
  return darkmode ? `2px solid ${colors.slate}` : '2px solid black'
}

const setZIndex = (showIncorrect, inputData, content, filledInput, highlight, guestHighlight) => {
  // show incorrect results
  if (showIncorrect && inputData && content.letter !== inputData.toUpperCase()) {
    return 5
  }

  if (filledInput === content.position) {
    return 3
  }

  // local client
  if (highlight) {
    return 3
  }

  // other clients
  if (guestHighlight) {
    return 2
  }

  // default
  return 1
}

const form = scale({
  padding: 0,
  margin: 0,
  height: '100%'
})

const circleClue = scale({
  width: '100%',
  height: '100%',
  border: `1px solid ${colors.slate}`,
  opacity: 1,
  borderRadius: '50%',
  position: 'absolute',
  top: 0,
  pointerEvents: 'none',
})

export default function Square({ props }) {
  const {
    circle,
    darkmode,
    content,
    hoveredClue,
    highlightedSquares,
    movementDirection,
    filledInput,
    showIncorrect,
    focus,
    name,
    guesses,
    nametagLocations,
    nametagData,
    clientId,
    uploadGuess,
    guestHighlights,
    setUploadGuess,
    setFocus,
    setMovementDirection,
    setSelectedSquare,
    setFilledInput,
    setBackspace,
    setGuesses,
    setInputChangeToApi
  } = props


  const [clickCount, setClickCount] = useState(0)
  const [highlight, setHighlight] = useState(false)
  const [inputData, setInputData] = useState('')
  const [selectionIterator, setSelectionIterator] = useState(0)
  const [guestHighlight, setGuestHighlight] = useState(false)

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
    // if guesses have been changed by guest, update square input value
    if (guesses && guesses[content.position - 1] !== inputData) {
      setInputData(guesses[content.position - 1])
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
      const inputToFill = { position: content.position, letter: '', iterator: 0 }
      setInputChangeToApi({ ...inputToFill })
      let newGuesses = guesses
      newGuesses[content.position - 1] = ''
      setGuesses([...newGuesses])
    }
  };

  const isGuestHighlight = () => {
    if (guestHighlights) {
      // Replace this deletion with a new method outside of Square
      const filteredHighlights = guestHighlights
      delete filteredHighlights[clientId]
      for (const [id, obj] of Object.entries(filteredHighlights)) {
        const { color, squares } = obj
        if (squares.includes(content.position)) {
          setGuestHighlight({ id, color: colorLookup[color] })
          return
        }
      }
      setGuestHighlight(false)
    }
  }

  useEffect(() => {
    isGuestHighlight()
  }, [guestHighlights])

  useEffect(() => {
    document.ontouchmove = () => {
      e.preventDefault()
    }
  })

  const squareInput = scale({
    caretColor: 'transparent',
    outlineWidth: 0,
    border: 'none',
    width: '100%',
    height: '100%',
    padding: 0,
    margin: 0,
    color: darkmode ? colors.offwhite : colors.slate,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontSize: '25px',
    lineHeight: 0,
    paddingTop: 4,
    fontWeight: 500,
    borderRadius: 0,
    webkitBorderRadius: 0,
    fontFamily: fonts.sans,
    backgroundColor: setBackgroundColor(darkmode, filledInput === content.position, highlightedSquares, content, focus, guestHighlight, showIncorrect, inputData),
    // transition: 'background-color 0.1s ease-in-out',
  })

  const squareBox = scale({
    position: 'relative',
    margin: 0,
    padding: 0,
    marginLeft: -2,
    marginBottom: -2,
    borderRadius: 2,
    border: setBorderColor(darkmode, filledInput === content.position, highlightedSquares, content, focus, guestHighlight, showIncorrect, inputData),
    zIndex: setZIndex(showIncorrect, inputData, content, filledInput, highlight, guestHighlight),
    color: colors.slate,
    // transition: 'border 0.1s ease-in-out',
    span: {
      color: darkmode ? colors.offwhite : 'black',
      position: 'absolute',
      top: 2,
      left: 2,
      webkitTouchCallout: 'none',
      webkitUserSelect: 'none',
      khtmlUserSelect: 'none',
      mozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none',
    }
  })

  return (
    <div id={content.position} css={squareBox}>
      <form css={form} autoComplete='off' onSubmit={(e) => e.preventDefault()}>
        {content.number > 0 && <span css={blockNumber}>{content.number}</span>}

        {/* Shows client username above square */}
        <Nametag
          props={{
            focus: focus === content.position,
            clientId,
            colorLookup,
            name,
            guestHighlight,
            nametagData,
            nametagLocations,
            content,
            darkmode,
          }}
        />

        {/* Skips rendering input for black squares */}
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
          css={squareInput}
          type='text'
          id={`input-${content.position}`}
          value={inputData}
          onChange={(input) => {
            if (input.nativeEvent.data && input.nativeEvent.data !== '') {
              setInputData(input.nativeEvent.data)
              setSelectionIterator(selectionIterator + 1)

              // TODO: Rename
              const inputToFill = { position: content.position, letter: input.nativeEvent.data, iterator: selectionIterator }
              setFilledInput({ ...inputToFill })
              setInputChangeToApi({ ...inputToFill })

              let newGuesses = guesses
              newGuesses[content.position - 1] = input.nativeEvent.data
              setGuesses([...newGuesses])
              // TODO: Remove if array spread operator fixes useEffect
              // picking up changes to state
              setUploadGuess(uploadGuess ? false : true)
            }
          }}
          name={content.letter} />}
      </form>
      {circle === 1 && <div css={circleClue}></div>}
    </div >
  )
}