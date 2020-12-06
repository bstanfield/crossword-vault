/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { getData } from '../lib/data'
import classNames from 'classnames'
import { useEffect, useState, Fragment } from 'react'
import Square from '../components/square'
import Clue from '../components/clue'
import socketIOClient from 'socket.io-client';
import Players from '../components/players'
import Timer from '../components/timer'
const ENDPOINT = 'http://127.0.0.1:4001';
// const ENDPOINT = 'https://multiplayer-crossword-server.herokuapp.com/'

// board ratios (temp hardcode)
let width = 15
let height = 15

let totalSquares = width * height

const appContainer = (darkmode) => scale({
  height: '100vh',
  minHeight: '80vh',
  padding: '0px 20px',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '120px',
  alignItems: 'center',
  paddingBottom: '40px',
  margin: 'auto',
  position: 'relative',
})

const appBackground = (darkmode) => scale({
  backgroundColor: darkmode ? 'black' : 'white',
  color: darkmode ? '#e4e4e4' : '#333333',
})

const boardContainer = (darkmode) => scale({
  cursor: 'text',
  display: 'grid',
  marginTop: '30px',
  width: '550px',
  backgroundColor: 'white',
  height: '550px',
  gridTemplateColumns: 'repeat(15, 1fr)',
  gridTemplateRows: 'repeat(15, 1fr)',
  border: '2px solid #333',
  borderLeft: '4px solid #333',
  borderBottom: '4px solid #333',
  borderRadius: '4px',
})

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
    return ''
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
  // Darkmode
  const [darkmode, setDarkmode] = useState(false)
  const [board, setBoard] = useState([])
  const [guesses, setGuesses] = useState([])
  const [hoveredClue, setHoveredClue] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState(false)
  const [highlightedSquares, setHighlightedSquares] = useState([])
  // CONSTRAIN USE TO MOVEMENT
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
  const [timestamp, setTimestamp] = useState(false)
  const [timer, setTimer] = useState(false)
  const [clientId, setClientId] = useState(false)
  const [response, setResponse] = useState('')
  const [socketConnection, setSocketConnection] = useState(false)
  const [emptyInput, setEmptyInput] = useState(false)
  const [guestHighlights, setGuestHighlights] = useState(false)
  const [players, setPlayers] = useState(false)
  const [inputChange, setInputChange] = useState(false)
  const [inputChangeToApi, setInputChangeToApi] = useState(false)

  useEffect(() => {
    console.log('new board: ', JSON.stringify(instantiateGuesses(grid)))
    const connection = socketIOClient(ENDPOINT)
    setSocketConnection(connection);

    connection.on('id', id => {
      setClientId(id)
    })

    // Sends board time once on connect
    connection.on('timestamp', time => {
      setTimestamp(time)
    })

    // Sent once on client connection
    connection.on('boardGuesses', data => {
      setResponse(data)
    })

    connection.on('inputChange', data => {
      console.log('new input: ', data)
      setInputChange(data)
    })

    connection.on('newPlayer', data => {
      setPlayers(data)
    })

    connection.on('newHighlight', data => {
      setGuestHighlights(data)
    })

    return () => connection.disconnect()
  }, []);

  // Perhaps a duplicate useEffect?
  // Check other [filledInput] dependent useEffect
  useEffect(() => {
    if (inputChangeToApi) {
      socketConnection.send({ type: 'input', value: inputChangeToApi })
    }
  }, [inputChangeToApi])

  useEffect(() => {
    setGuesses(response)
  }, [response])

  useEffect(() => {
    setBoard(
      createBoard(crossword, totalSquares, setDownGroupings, setAcrossGroupings, setGuesses)
    )
  }, [])

  useEffect(() => {
    const { position, letter } = inputChange
    if (guesses[position] !== letter) {
      const newGuesses = guesses
      newGuesses[position] = letter
      console.log('newGuesses: ', newGuesses)
      setGuesses([...newGuesses])
    }
  }, [inputChange])

  // Functions for across movement
  useEffect(() => {
    const groupingsToUse = movementDirection === 'across' ? acrossGroupings : downGroupings
    if (selectedSquare) {
      groupingsToUse.map((group, index) => {
        if (group.includes(selectedSquare)) {
          setClueIndex(index)
          setHighlightedSquares(group)
          socketConnection.send({ type: 'newHighlight', value: group })
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
    if (guesses.length > 0) {
      const correctGuesses = guesses.reduce((acc, current, index) => {
        let starterAcc = { correct: 0, incorrect: 0 }
        if (!acc) {
          acc = starterAcc
        }

        if (current === false || current === '') return acc
        if (current.toUpperCase() === board[index].letter) {
          const newAcc = { correct: acc.correct + 1, incorrect: acc.incorrect }
          console.log('new acc: ', newAcc)
          return newAcc
        }
        const newAcc = { correct: acc.correct, incorrect: acc.incorrect + 1 }
        return newAcc
      })
      console.log('total correct guesses: ', correctGuesses)
    }
  }, [guesses])

  useEffect(() => {
    if (timestamp) {
      let seconds = timestamp / 1000
      let timeElapsed = Date.now() / 1000 - seconds
      const intervalId = setInterval(() => {
        timeElapsed++
        setTimer(timeElapsed)
      }, 1000)

      return () => clearInterval(intervalId);
    }
  }, [timestamp])

  return (
    <div css={appBackground(darkmode)}>
      <Head>
        <title>The Vault</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"></link>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div css={{ borderBottom: '1px solid #333333', zIndex: 999, position: 'absolute', width: '100%', height: '70px', top: 12, left: 0, right: 0, margin: 'auto' }}>
        <div css={{ padding: '0 60px' }}>
          <Players props={{ darkmode, setDarkmode, players }} />

          <div>
            <p css={{ maxWidth: 300, margin: 'auto', fontFamily: 'Old Standard TT, Serif', fontWeight: 400, fontStyle: 'italic', letterSpacing: -4, fontSize: 50, textAlign: 'center' }}>Word Vault</p>
          </div>
        </div>
      </div>
      <div css={appContainer(darkmode)}>


        <main className={styles.main}>
          <div className={styles.crossword_board__container}>
            <div css={boardContainer(darkmode)}>
              {board.map(
                (content, index) => (
                  <Square key={index} props={{
                    darkmode,
                    content,
                    hoveredClue,
                    highlightedSquares,
                    selectedSquare,
                    filledInput,
                    movementDirection,
                    guesses,
                    focus,
                    uploadGuess,
                    clientId,
                    guestHighlights,
                    setEmptyInput,
                    setUploadGuess,
                    setFocus,
                    setBackspace,
                    setMovementDirection,
                    setSelectedSquare,
                    setFilledInput,
                    setGuesses,
                    setInputChangeToApi
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
                      darkmode,
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
                      darkmode,
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
          <Timer props={{ timer }} />
        </main>
      </div>
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
