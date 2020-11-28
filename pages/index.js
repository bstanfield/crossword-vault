import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { getData } from '../lib/data'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import Square from '../components/square'
import Clue from '../components/clue'
import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:4001';

// board ratios (temp hardcode)
let width = 15
let height = 15

let totalSquares = width * height

const createDownGroupings = (crossword) => {
  const { grid, answers } = crossword
  // how many down clues?
  // const totalAnswers = answers.down.length
  // let assignedAnswers = 0
  let position = 1
  let grouping = []
  while (position <= 225) {
    if (grid[position - 1] !== '.') {
      let match = false
      if (grouping.length === 0) {
        grouping.push([position])
      } else {
        grouping.map((group, index) => {
          if (group.includes(position - 15)) {
            match = true
            grouping[index].push(position)
          }
        })
        if (!match) {
          grouping.push([position])
        }
      }
    }
    position++
  }
  return grouping
}

const instantiateGuesses = (grid) => grid.map(item => {
  if (item === '.') {
    return false
  } else {
    return null
  }
})

const createBoard = (crossword, total, setDownGroupings, setAcrossGroupings, setGuesses) => {
  const { grid, gridnums } = crossword
  let partial = 0
  let arr = []
  let acrossGrouping = []
  let acrossGroupings = []
  let rowPosition = 0
  let guesses = []

  while (partial < total) {
    partial++
    rowPosition++

    // Reset grouping after each dot OR after 15 squares
    if (grid[partial - 1] === '.') {
      acrossGroupings.push(acrossGrouping)
      acrossGrouping = []
    } else {
      acrossGrouping.push(partial)
    }
    if (rowPosition === 15) {
      acrossGroupings.push(acrossGrouping)
      acrossGrouping = []
      rowPosition = 0
    }



    arr.push({ acrossGrouping, number: gridnums[partial - 1], letter: grid[partial - 1], position: partial })
  }
  const downGroupings = createDownGroupings(crossword)
  setDownGroupings(downGroupings.filter(grouping => grouping.length > 0))
  setAcrossGroupings(acrossGroupings.filter(grouping => grouping.length > 0))
  return arr
}

export default function Home({ data }) {
  const { crossword } = data
  const { grid, clues } = crossword
  const [board, setBoard] = useState([])
  const [guesses, setGuesses] = useState(instantiateGuesses(grid))
  const [hoveredClue, setHoveredClue] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState(false)
  const [highlightedSquares, setHighlightedSquares] = useState([])
  const [filledInput, setFilledInput] = useState(false)
  // Determines which clue to highlight
  const [clueIndex, setClueIndex] = useState(false)
  // Is a square focused?
  const [focus, setFocus] = useState(false)
  // Refactor this one later. It allows a clue onClick to highlight the corresponding squares!
  const [newFocus, setNewFocus] = useState(false)
  // Milliseconds for lockout of clue hover
  const [lockout, setLockout] = useState(false)
  // HACK
  const [uploadGuess, setUploadGuess] = useState(false)

  const [movementDirection, setMovementDirection] = useState('across')

  // Keyboard shortcuts
  const [backspace, setBackspace] = useState(false)
  const [movementKey, setMovementKey] = useState(false)

  const [downGroupings, setDownGroupings] = useState([])
  const [acrossGroupings, setAcrossGroupings] = useState([])

  // API
  const [response, setResponse] = useState('');

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on('FromAPI', data => {
      setResponse(data);
    });

    // CLEAN UP THE EFFECT
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    console.log('response: ', response)
  }, [response])

  useEffect(() => {
    setBoard(
      createBoard(crossword, totalSquares, setDownGroupings, setAcrossGroupings, setGuesses)
    )
  }, [])

  // Functions for across movement
  // ERROR: Down groupings are shifted over
  useEffect(() => {
    const groupingsToUse = movementDirection === 'across' ? acrossGroupings : downGroupings
    if (selectedSquare) {
      groupingsToUse.map((group, index) => {
        if (group.includes(selectedSquare)) {
          setClueIndex(index)
          setHighlightedSquares(group)
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

  // Usecase: Click on clue, highlights corresponding squares and 
  useEffect(() => {
    if (newFocus !== false) {
      const groupingsToUse = movementDirection === 'across' ? acrossGroupings : downGroupings
      document.getElementById(`input-${groupingsToUse[newFocus][0]}`).focus()
    }
  }, [newFocus])

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
      const arrowKeys = { 'ArrowRight': 1, 'ArrowLeft': -1, 'ArrowUp': -15, 'ArrowDown': 15 }
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
        setClueIndex(nextClue)
        setHighlightedSquares(groupingsToUse[nextClue])
        const nextLocation = groupingsToUse[nextClue][0]
        document.getElementById(`input-${nextLocation}`).focus()
      }

      // This is working properly but something is fucking it up
      if (movementKey === 'Shift+Tab') {
        const groupingsToUse = movementDirection === 'across' ? acrossGroupings : downGroupings
        const previousClue = clueIndex - 1
        setClueIndex(previousClue)
        setHighlightedSquares(groupingsToUse[previousClue])
        const previousLocation = groupingsToUse[previousClue][0]
        document.getElementById(`input-${previousLocation}`).focus()
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

  useEffect(() => {
    console.log('guesses: ', guesses)
  }, [uploadGuess])

  return (
    <div className={styles.container}>
      <Head>
        <title>The Vault</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300&display=swap" rel="stylesheet"></link>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          The Word Vault
        </h1>
        <br />

        <div className={styles.crossword_board__container}>
          <div className={styles.crossword_board}>
            {board.map(
              (content, index) => (
                <Square key={index} props={{
                  content,
                  hoveredClue,
                  highlightedSquares,
                  selectedSquare,
                  filledInput,
                  movementDirection,
                  guesses,
                  focus,
                  uploadGuess,
                  setUploadGuess,
                  setFocus,
                  setBackspace,
                  setMovementDirection,
                  setSelectedSquare,
                  setFilledInput,
                  setGuesses
                }} />
              )
            )}
          </div>

          <div className={classNames(styles.crossword_clues__list)}>
            <h2>Across</h2>
            <ul className={classNames(styles.crossword_clues__list, styles.crossword_clues__list__across)}>
              {clues.across.map((clue, index) => (
                <Clue
                  key={index}
                  props={{
                    lockout,
                    index,
                    clue,
                    clueIndex,
                    movementDirection,
                    direction: 'across',
                    setLockout,
                    setNewFocus,
                    setMovementDirection,
                    setHoveredClue,
                    setFocus
                  }}
                />
              ))}
            </ul>
          </div>
          <div className={classNames(styles.crossword_clues__list)}>
            <h2>Down</h2>
            <ul className={classNames(styles.crossword_clues__list, styles.crossword_clues__list__down)}>
              {clues.down.map((clue, index) => (
                <Clue
                  key={index}
                  props={{
                    lockout,
                    index,
                    clue,
                    clueIndex,
                    movementDirection,
                    direction: 'down',
                    setLockout,
                    setNewFocus,
                    setMovementDirection,
                    setHoveredClue,
                    setFocus
                  }}
                />
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps() {
  const data = getData()

  return {
    props: {
      data,
    }
  }
}
