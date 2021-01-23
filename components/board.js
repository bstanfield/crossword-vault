/** @jsx jsx */

import { jsx } from '@emotion/react'
import { useEffect, useState } from 'react'
import styles from '../lib/boardStyles'
import Square from './square';
import { width } from '../lib/constants'

export default function Board({ props }) {
  const {
    clientId,
    board,
    hoveredClue,
    showIncorrect,
    name,
    nametagLocations,
    nametagData,
    darkmode,
    movementDirection,
    data,
    newFocus,
    clueIndex,
    downGroupings,
    acrossGroupings,
    guestHighlights,
    handleSendToSocket,
    guesses,
    setGuesses,
    setClueIndex,
    setMovementDirection,
  } = props
  const { grid, clues } = data
  const [selectedSquare, setSelectedSquare] = useState(false)
  const [highlightedSquares, setHighlightedSquares] = useState([])

  // CONSTRAIN USE TO MOVEMENT
  const [filledInput, setFilledInput] = useState(false)
  // Is a square focused?
  const [focus, setFocus] = useState(false)
  // HACK
  const [uploadGuess, setUploadGuess] = useState(false)

  // Keyboard shortcuts
  const [backspace, setBackspace] = useState(false)
  const [movementKey, setMovementKey] = useState(false)

  // API
  const [inputChangeToApi, setInputChangeToApi] = useState(false)

  // Functions for across movement
  useEffect(() => {
    const groupingsToUse = movementDirection === 'across' ? acrossGroupings : downGroupings
    if (selectedSquare) {
      groupingsToUse.map((group, index) => {
        if (group.includes(selectedSquare)) {
          setClueIndex(index)
          setHighlightedSquares(group)
          // TODO: Tell [game] that your movement direction changed as callback
          // socketConnection.send({ type: 'newHighlight', value: group })
          handleSendToSocket({ type: 'newHighlight', value: group })
          if (!hoveredClue) {
            const clue = document.getElementById(`${index}-${movementDirection}`)
            if (clue) {
              clue.scrollIntoView({ behavior: 'smooth' })
            }
          }
        }
      })
    } else {
      // Default state with no squares highlighted
      // This doesn't work rn
      // setHighlightedSquares([])
    }
  }, [selectedSquare, movementDirection])

  // Triggers with user click on clue, not square / input
  // newFocus gets passed down from [game] and passed up from
  // ClueList, so when it changes, triggers following use effect:
  useEffect(() => {
    if (newFocus !== false) {
      const groupingsToUse = movementDirection === 'across' ? acrossGroupings : downGroupings
      document.getElementById(`input-${groupingsToUse[newFocus][0]}`).focus()
    }
  }, [newFocus])


  // COMBINE following 2 useEffects and abstract into handleBoardStateChange fn
  // that both moves user to next input + sends data through socket
  // Moves user to next input
  useEffect(() => {
    if (filledInput) {
      const { position } = filledInput
      const currentLocation = highlightedSquares.indexOf(position)
      const nextLocation = highlightedSquares[currentLocation + 1]

      if (highlightedSquares.indexOf(nextLocation) !== -1) {
        document.getElementById(`input-${nextLocation}`).focus()
      } else {
        setFilledInput(false)
      }
    }
  }, [filledInput])
  useEffect(() => {
    if (inputChangeToApi) {
      handleSendToSocket({ type: 'input', value: inputChangeToApi })
    }
  }, [inputChangeToApi])

  useEffect(() => {
    if (backspace) {
      const currentLocation = highlightedSquares.indexOf(selectedSquare)
      const nextLocation = highlightedSquares[currentLocation - 1]

      if (highlightedSquares.indexOf(nextLocation) !== -1) {
        document.getElementById(`input-${nextLocation}`).focus()
      }
      // Reset
      setBackspace(false)
    }
  }, [backspace])

  // Only works for right arrow key
  // Might want to make this _clue agnostic_ (just move to the next grid point)
  useEffect(() => {
    if (movementKey) {
      // Sets each arrow keys movements in the grid
      const arrowKeys = { 'ArrowRight': 1, 'ArrowLeft': -1, 'ArrowUp': -width, 'ArrowDown': width }
      if (movementKey.includes('Arrow')) {
        // Instead of next location within highlighted squares, just next location on
        // board and determine if there should be a new set of highlighted squares (new clue)
        if (selectedSquare) {
          const nextLocation = selectedSquare + arrowKeys[movementKey]
          const nextLocationInput = document.getElementById(`input-${nextLocation}`)
          if (nextLocationInput) {
            document.getElementById(`input-${nextLocation}`).focus()
          }
        }
      }

      if (movementKey === 'Tab') {
        const groupingsToUse = movementDirection === 'across' ? acrossGroupings : downGroupings
        const nextClue = clueIndex + 1

        // Creates boundary so you can't tab outside of board
        if (nextClue < groupingsToUse.length) {
          setClueIndex(nextClue)
          setHighlightedSquares(groupingsToUse[nextClue])
          const nextLocation = groupingsToUse[nextClue][0]
          document.getElementById(`input-${nextLocation}`).focus()
        }
      }

      // This is working properly but something is fucking it up
      if (movementKey === 'Shift+Tab') {
        const groupingsToUse = movementDirection === 'across' ? acrossGroupings : downGroupings
        const previousClue = clueIndex - 1
        if (previousClue >= 0) {
          setClueIndex(previousClue)
          setHighlightedSquares(groupingsToUse[previousClue])
          const previousLocation = groupingsToUse[previousClue][0]
          document.getElementById(`input-${previousLocation}`).focus()
        }
      }

      if (movementKey === ' ') {
        setMovementDirection(movementDirection === 'across' ? 'down' : 'across')
      }

      setMovementKey(false)
    }
  }, [movementKey])

  useEffect(() => {
    document.addEventListener('keydown', function (event) {
      const acceptableKeys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' ']

      if (acceptableKeys.includes(event.key)) {
        setMovementKey(event.key)

      }

      // Toggles back and forth between words
      if (event.shiftKey && event.key === 'Tab') {
        setMovementKey('Shift+Tab')
      } else if (event.key === 'Tab') {
        setMovementKey(event.key)
      }
    })
  }, [])

  return (
    <div css={styles.boardContainer}>
      {board.map((content, index) => (
        <Square key={index} props={{
          circle: data.circles && data.circles[index],
          darkmode,
          content,
          hoveredClue,
          highlightedSquares,
          selectedSquare,
          filledInput,
          movementDirection,
          guesses,
          focus,
          name,
          uploadGuess,
          clientId,
          guestHighlights,
          showIncorrect,
          nametagLocations,
          nametagData,
          setUploadGuess,
          setFocus,
          setBackspace,
          setMovementDirection,
          setSelectedSquare,
          setFilledInput,
          setGuesses,
          setInputChangeToApi
        }}
        />
      )
      )}
    </div>
  )
}
