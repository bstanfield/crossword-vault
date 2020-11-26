import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { getData } from '../lib/data'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import Square from '../components/square'
import Clue from '../components/clue'
import useEventListener from '@use-it/event-listener'

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

const createBoard = (crossword, total, setDownGroupings, setAcrossGroupings) => {
  const { grid, gridnums } = crossword
  let partial = 0
  let arr = []
  let acrossGrouping = []
  let acrossGroupings = []
  let rowPosition = 0

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
  const { clues } = crossword
  const [board, setBoard] = useState([])
  const [hoveredClue, setHoveredClue] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState(false)
  const [highlightedSquares, setHighlightedSquares] = useState([])
  const [filledInput, setFilledInput] = useState(false)
  // Determines which clue to highlight
  const [clueIndex, setClueIndex] = useState(false)

  const [movementDirection, setMovementDirection] = useState('across')

  // Keyboard shortcuts
  const [backspace, setBackspace] = useState(false)
  const [movementKey, setMovementKey] = useState(false)
  const [previousKey, setPreviousKey] = useState(false)

  const [downGroupings, setDownGroupings] = useState([])
  const [acrossGroupings, setAcrossGroupings] = useState([])

  useEffect(() => {
    setBoard(
      createBoard(crossword, totalSquares, setDownGroupings, setAcrossGroupings)
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
        }
      })
    } else {
      // Default state with no squares highlighted
      // This doesn't work rn
      // setHighlightedSquares([])
    }
  }, [selectedSquare, movementDirection])

  // Moves user to next input
  useEffect(() => {
    if (filledInput) {
      const currentLocation = highlightedSquares.indexOf(filledInput)
      const nextLocation = highlightedSquares[currentLocation + 1]

      if (highlightedSquares.indexOf(nextLocation) !== -1) {
        document.getElementById(`input-${nextLocation}`).focus();
      } else {
        setFilledInput(false)
      }
    }
  }, [filledInput])

  useEffect(() => {
    if (backspace) {
      console.log('backspace detected!')
      const currentLocation = highlightedSquares.indexOf(selectedSquare)
      const nextLocation = highlightedSquares[currentLocation - 1]

      if (highlightedSquares.indexOf(nextLocation) !== -1) {
        document.getElementById(`input-${nextLocation}`).focus();
      }
      // Reset
      setBackspace(false)
    }
  }, [backspace])

  const handler = ({ key }) => {
    // Spacebar changes movement direction
    if (key === ' ') {
      setMovementDirection(movementDirection === 'across' ? 'down' : 'across')
    }

    if (key === 'ArrowRight') {
      setMovementKey(key)
    }

    if (key === 'ArrowLeft') {
      setMovementKey(key)
    }

    if (key === 'Tab') {
      setMovementKey(key)
    }

    if (key === 'Shift') {
      setMovementKey(key)
    }
  }

  // Only works for right arrow key
  // Might want to make this _clue agnostic_ (just move to the next grid point)
  useEffect(() => {
    if (movementKey) {
      if (movementKey === 'ArrowRight') {
        const currentLocation = highlightedSquares.indexOf(selectedSquare)
        const nextLocation = highlightedSquares[currentLocation + 1]

        if (highlightedSquares.indexOf(nextLocation) !== -1) {
          document.getElementById(`input-${nextLocation}`).focus();
        }
      }

      if (movementKey === 'ArrowLeft') {
        const currentLocation = highlightedSquares.indexOf(selectedSquare)
        const nextLocation = highlightedSquares[currentLocation - 1]

        if (highlightedSquares.indexOf(nextLocation) !== -1) {
          document.getElementById(`input-${nextLocation}`).focus();
        }
      }

      // ONLY WORKS FOR ACROSS
      if (movementKey === 'Tab') {
        const nextClue = clueIndex + 1
        setClueIndex(nextClue)
        setHighlightedSquares(acrossGroupings[nextClue])
        const nextLocation = acrossGroupings[nextClue][0]
        document.getElementById(`input-${nextLocation}`).focus();
      }

      // Really jank solution for modifier keys
      if (previousKey === 'Shift' && movementKey === 'Tab') {
        const previousClue = clueIndex - 1
        setClueIndex(previousClue)
        setHighlightedSquares(acrossGroupings[previousClue])
        const previousLocation = acrossGroupings[previousClue][0]
        document.getElementById(`input-${previousLocation}`).focus();
      }

      setMovementKey(false)
      setPreviousKey(movementKey)
    }
  }, [movementKey])

  useEventListener('keydown', handler);

  // Alternative keydown method
  // TODO: Transition to this!
  useEffect(() => {
    document.addEventListener('keydown', function (event) {
      if (event.shiftKey && event.key === 'Tab') {
        alert('Back!');
      }
    });
  }, [])

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
          <div className={classNames(styles.crossword_clues__list)}>
            <h2>Across</h2>
            <ul className={classNames(styles.crossword_clues__list, styles.crossword_clues__list__across)}>
              {clues.across.map((clue, index) => (<Clue props={{ index, clue, clueIndex, movementDirection, direction: 'across', setMovementDirection, setHoveredClue }} />))}
            </ul>
          </div>
          <div>
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
                    setBackspace,
                    setMovementDirection,
                    setSelectedSquare,
                    setFilledInput
                  }} />
                )
              )}
            </div>
            <h2>Down</h2>
            <ul className={classNames(styles.crossword_clues__list, styles.crossword_clues__list__down)}>
              {clues.down.map((clue, index) => (<Clue props={{ index, clue, clueIndex, movementDirection, direction: 'down', setMovementDirection, setHoveredClue }} />))}
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
