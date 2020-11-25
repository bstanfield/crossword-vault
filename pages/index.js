import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { getData } from '../lib/data'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import Square from '../components/Square'
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
  setDownGroupings(downGroupings)
  setAcrossGroupings(acrossGroupings)
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

  const [movementDirection, setMovementDirection] = useState('across')
  const [movementKey, setMovementKey] = useState(false)

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
      groupingsToUse.map(group => {
        if (group.includes(selectedSquare)) {
          setHighlightedSquares(group)
        }
      })
    } else {
      // Default state with no squares highlighted
      setHighlightedSquares([])
    }
  }, [selectedSquare, movementDirection])

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

      setMovementKey(false)
    }
  }, [movementKey])

  useEventListener('keydown', handler);

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
              {clues.across.map((clue, index) => (<li onMouseLeave={() => setHoveredClue(false)} onMouseEnter={() => { setMovementDirection('across'); setHoveredClue(Number(clue.split('.')[0])) }} key={index} id={index}><strong>{clue.split('.')[0]}.</strong> {clue.split('.')[1]}</li>))}
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
                    setMovementDirection,
                    setSelectedSquare,
                    setFilledInput
                  }} />
                )
              )}
            </div>
            <h2>Down</h2>
            <ul className={classNames(styles.crossword_clues__list, styles.crossword_clues__list__down)}>
              {clues.down.map((clue, index) => (<li onMouseLeave={() => setHoveredClue(false)} onMouseEnter={() => { setMovementDirection('down'); setHoveredClue(Number(clue.split('.')[0])) }} key={index} id={index}><strong className={styles.crossword_clues__list__item__number}>{clue.split('.')[0]}.</strong> {clue.split('.')[1]}</li>))}
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
