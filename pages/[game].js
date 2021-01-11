/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale, colors, fonts, ENDPOINT } from '../lib/helpers'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import Square from '../components/square'
import Clue from '../components/clue'
import socketIOClient from 'socket.io-client';
import Players from '../components/players'
import Timer from '../components/timer'
import Metadata from '../components/metadata'
import Alert from '../components/alert'
import Button from '../components/button'
import Shortcuts from '../components/shortcuts'
import smoothscroll from 'smoothscroll-polyfill';
import Popup from '../components/popup'
import PuzzleSelector from '../components/puzzleSelector'

// board ratios (temp hardcode)
const width = 15
const height = 15
const totalSquares = width * height

const clueHeader = scale({
  marginTop: 30,
  paddingBottom: 6,
  borderBottom: `1.5px solid ${colors.mediumgrey}`,
})

const appContainer = scale({
  height: '100vh',
  padding: '0px 20px',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '90px',
  alignItems: 'center',
  margin: 'auto',
  position: 'relative',
})

const appBackground = (darkmode) => scale({
  backgroundColor: darkmode ? 'black' : colors.offwhite,
  color: darkmode ? colors.offwhite : colors.slate,
  overflowX: 'hidden',
  position: 'relative',
})

const loadingSpinner = () => scale({
  position: 'absolute',
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
  margin: 'auto',
  textAlign: 'center',
  height: 200,
  width: 200,
})

const boardContainer = scale({
  cursor: 'text',
  display: 'grid',
  marginTop: '30px',
  width: 'auto',
  backgroundColor: colors.slate,
  height: 'auto',
  gridTemplateColumns: `repeat(${height}, 1fr)`,
  gridTemplateRows: `repeat(${width}, 1fr)`,
  border: `4px solid ${colors.slate}`,
  borderLeft: `5px solid ${colors.slate}`,
  borderBottom: `5px solid ${colors.slate}`,
  borderRadius: '4px',
})

const crosswordClues = scale({
  listStyleType: 'none',
  padding: 0,
  ul: {
    margin: 0,
    padding: 0,
    maxHeight: 500,
    overflowY: 'scroll',
  },
  li: {
    cursor: 'pointer',
    paddingBottom: 6,
  }
})

const createDownGroupings = (crossword) => {
  const { grid } = crossword
  // how many down clues?
  // const totalAnswers = answers.down.length
  // let assignedAnswers = 0
  let position = 1
  let grouping = []
  while (position <= totalSquares) {
    if (grid[position - 1] !== '.') {
      let match = false
      if (grouping.length === 0) {
        grouping.push([position])
      } else {
        grouping.map((group, index) => {
          if (group.includes(position - width)) {
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

    // Reset grouping after each dot OR after <width> squares
    if (grid[partial - 1] === '.') {
      acrossGroupings.push(acrossGrouping)
      acrossGrouping = []
    } else {
      acrossGrouping.push(partial)
    }
    if (rowPosition === width) {
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

export default function Home() {
  const [data, setData] = useState(false)
  const { grid, clues } = data

  // Darkmode
  const [darkmode, setDarkmode] = useState(false)

  const [board, setBoard] = useState([])
  const [grading, setGrading] = useState(false)
  const [guesses, setGuesses] = useState([])
  const [hoveredClue, setHoveredClue] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState(false)
  const [highlightedSquares, setHighlightedSquares] = useState([])
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [showIncorrect, setShowIncorrect] = useState(false)

  // Nametags
  const [showPopup, setShowPopup] = useState(false)
  const [name, setName] = useState(false)
  const [nametagLocations, setNametagLocations] = useState([])
  const [nametagData, setNametagData] = useState([])

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

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const path = window.location.pathname
    let room = false
    if (path) {
      room = path.split('/')[1]
    }

    const connection = socketIOClient(ENDPOINT)
    setSocketConnection(connection)

    smoothscroll.polyfill()

    connection.on('reject', () => {
      window.location.href = `/`
    })

    connection.on('connect', () => {
      connection.emit('join', room)

      // Attempting to fix tab unfocus issue
      if (name) {
        connection.emit('name', name)
      }
    })

    connection.on('id', id => {
      setClientId(id)

      // Attempting to fix tab unfocus issue
      if (name) {
        connection.emit('name', name)
      }
    })

    // Sends board time once on connect
    connection.on('timestamp', time => {
      setTimestamp(time)
    })

    connection.on('board', board => {
      console.log('received board: ', board)
      setData(board)
    })

    // Alert should do more than just setLoading...
    connection.on('loading', boolean => {
      setLoading(boolean)

      // Reset stuff
      setFocus(false)
      setHighlightedSquares([])
      setHoveredClue(false)
      setSelectedSquare(false)
      setGuestHighlights(false)
    })

    // Sent once on client connection
    connection.on('guesses', data => {
      setResponse(data)
    })

    connection.on('inputChange', data => {
      setInputChange(data)
    })

    connection.on('newPlayer', data => {
      setPlayers(data)
    })

    connection.on('newHighlight', data => {
      let filteredHighlights = {}

      // Grab first square of every guest highlight to place nametag 
      let nametags = []
      let nametagLookup = []
      for (const [key, value] of Object.entries(data)) {
        if (value.room === room) {
          filteredHighlights[key] = value

          nametags.push(value.squares[0])
          nametagLookup.push({ id: value.id, location: value.squares[0], name: value.name, color: value.color })
        }
      }
      setGuestHighlights(filteredHighlights)
      setNametagLocations(nametags)
      setNametagData(nametagLookup)
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
    if (!name) {
      setShowPopup(true)
    }
  }, [])

  useEffect(() => {
    if (name) {
      socketConnection.emit('name', name)
      setShowPopup(false)
    }
  }, [name])

  useEffect(() => {
    setGuesses(response)
  }, [response])

  useEffect(() => {
    if (data) {
      setBoard(
        createBoard(data, totalSquares, setDownGroupings, setAcrossGroupings, setGuesses)
      )
    }
  }, [data])

  useEffect(() => {
    console.log('show incorrect: ', showIncorrect)
  }, [showIncorrect])

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

  useEffect(() => {
    let incorrect = 0
    let correct = 0
    let blank = 0
    let black = 0

    if (guesses.length > 0) {
      guesses.map((guess, index) => {
        if (guess === false) {
          black++
          return
        }
        if (guess === '') {
          blank++
          return
        }
        if (guess.toUpperCase() === board[index].letter) {
          correct++
          return
        }
        incorrect++
      })
    }
    setGrading({ correct, incorrect, blank, black })
  }, [guesses])

  useEffect(() => {
    if (guesses.length > 0 && grading) {
      if (grading.correct === totalSquares - grading.black) {
        // Alert goes here
      }
    }
  }, [grading])

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

  if (!data || loading) {
    return (
      <div css={[appBackground(darkmode), { height: '100vh' }]}>
        <Head>
          <title>Word Vault</title>
          <link rel="icon" href="/favicon.ico" />
          <script src="https://unpkg.com/ionicons@5.2.3/dist/ionicons.js"></script>
        </Head>
        <div css={loadingSpinner}>
          <div className={styles.lds_ring}><div></div><div></div></div>
          <p>Loading puzzle...</p>
        </div>
      </div>
    )
  } else {
    return (
      <div css={appBackground(darkmode)}>
        <Head>
          <title>Word Vault</title>
          <script src="https://unpkg.com/ionicons@5.2.3/dist/ionicons.js"></script>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"></link>
          <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet"></link>
          <link href="https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"></link>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Popup props={{ showPopup, setName }} />
        <Shortcuts props={{ show: showSidePanel, darkmode }} />
        <div css={{ borderBottom: `1px solid ${darkmode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`, zIndex: 2, position: 'absolute', width: '100%', height: '55px', top: 12, left: 0, right: 0, margin: 'auto' }}>
          <div css={{ padding: '0 32px' }}>
            <Players props={{ darkmode, setDarkmode, players }} />

            <div>
              <p css={{ maxWidth: 300, margin: 'auto', fontFamily: fonts.headline, fontWeight: 400, fontStyle: 'italic', letterSpacing: -3, fontSize: 36, textAlign: 'center', marginTop: 3 }}>Word Vault</p>
            </div>
          </div>
        </div>
        <div css={appContainer}>


          <main css={{ marginTop: 8 }}>
            <Metadata props={{ data }} />
            <div className={styles.crossword_board__container}>
              <div css={boardContainer}>
                {board.map(
                  (content, index) => (
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
                      setEmptyInput,
                      setUploadGuess,
                      setFocus,
                      setBackspace,
                      setMovementDirection,
                      setSelectedSquare,
                      setFilledInput,
                      setGuesses,
                      setInputChange,
                      setInputChangeToApi
                    }} />
                  )
                )}
              </div>

              <div css={crosswordClues}>
                <h2 css={clueHeader}>Across</h2>
                <ul>
                  {clues && clues.across.map((clue, index) => (
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
              <div css={crosswordClues}>
                <h2 css={clueHeader}>Down</h2>
                <ul>
                  {clues && clues.down.map((clue, index) => (
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

            {/* <Timer props={{ timer, grading }} /> */}

            <div css={{ marginTop: 6 }}>
              <Alert props={{ guesses, grading, showIncorrect, setShowIncorrect }} />
              <span css={{ marginRight: 8 }} onClick={() => setShowSidePanel(showSidePanel ? false : true)}>
                <Button props={{ darkmode, text: 'Shortcuts', icon: { name: 'flash', size: 14 } }} />
              </span>

              <PuzzleSelector
                props={{
                  darkmode,
                  socketConnection
                }}
              />

              <p css={{ display: 'inline-block', fontSize: 14, paddingLeft: 12 }}>Playing as <strong>{name || 'anonymous'}</strong></p>
            </div>
          </main>
        </div>
      </div >
    )
  }
}
