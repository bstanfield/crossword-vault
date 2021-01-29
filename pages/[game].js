/** @jsx jsx */

import { jsx } from '@emotion/react'
import { fonts, ENDPOINT } from '../lib/helpers'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import Clue from '../components/clue'
import socketIOClient from 'socket.io-client';
import Players from '../components/players'
import Metadata from '../components/metadata'
import Alert from '../components/alert'
import Button from '../components/button'
import Shortcuts from '../components/shortcuts'
import smoothscroll from 'smoothscroll-polyfill';
import Popup from '../components/popup'
import PuzzleSelector from '../components/puzzleSelector'
import Board from '../components/board'
import styles from '../lib/boardStyles'

// board ratios (temp hardcode)
const width = 15
const height = 15
const totalSquares = width * height

const setMedal = (place) => {
  let medal;
  switch (place) {
    case 0:
      medal = '🥇  '
      break
    case 1:
      medal = '🥈  '
      break
    case 2:
      medal = '🥉  '
      break
    default:
      medal = <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      break
  }
  return medal
}

const calculateScores = (scores) => {
  let users = []
  for (const [key, val] of Object.entries(scores)) {
    if (key !== 'claimedGuesses') {
      users.push([key, val.correct, val.correct / (val.correct + val.incorrect) * 100])
    }
  }

  users.sort((a, b) => {
    if (a[2] > b[2]) {
      return -1
    }
    if (b[2] > a[2]) {
      return 1
    }
    return 0
  })
  return (
    users.map((user, index) => <li><strong>{setMedal(index)}{user[0]}:</strong> {Math.round(user[2])}% accuracy ({user[1]} squares)</li>)
  )
}

const createDownGroupings = (crossword) => {
  const { grid } = crossword

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
  const [guestInputChange, setGuestInputChange] = useState([])
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [showIncorrect, setShowIncorrect] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [room, setRoom] = useState(null)
  const [complete, setComplete] = useState(false)

  // Nametags
  const [name, setName] = useState(false)
  const [nametagLocations, setNametagLocations] = useState([])
  const [nametagData, setNametagData] = useState([])

  // CONSTRAIN USE TO MOVEMENT
  // Determines which clue to highlight
  const [clueIndex, setClueIndex] = useState(false)
  // Is a square focused?
  const [focus, setFocus] = useState(false)
  // Refactor this one later. It allows a clue onClick to highlight the corresponding squares!
  const [newFocus, setNewFocus] = useState(false)
  // Milliseconds for lockout of clue hover
  const [lockout, setLockout] = useState(false)
  const [movementDirection, setMovementDirection] = useState('across')
  const [downGroupings, setDownGroupings] = useState([])
  const [acrossGroupings, setAcrossGroupings] = useState([])

  // API
  const [timestamp, setTimestamp] = useState(false)
  const [timer, setTimer] = useState(false)
  const [clientId, setClientId] = useState(false)
  const [socketConnection, setSocketConnection] = useState(false)
  const [guestHighlights, setGuestHighlights] = useState(false)
  const [players, setPlayers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scores, setScores] = useState(null)

  useEffect(() => {
    const path = window.location.pathname
    let room = false
    if (path) {
      room = path.split('/')[1]
      setRoom(room)
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
      setShowIncorrect(false)
    })

    // Sent once on client connection
    connection.on('guesses', data => {
      setGuesses(data)
    })

    connection.on('inputChange', data => {
      setGuestInputChange(data)
    })

    connection.on('newPlayer', data => {
      setPlayers(data)
    })

    // Sends at end of game to show guest scores
    connection.on('scores', data => {
      setScores(data)
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

  useEffect(() => {
    if (!name) {
      setShowPopup(true)
    }
  }, [])

  useEffect(() => {
    const { position, letter } = guestInputChange

    if (guesses[position] !== letter) {
      guesses[position] = letter
      setGuesses([...guesses])
    }
  }, [guestInputChange])

  useEffect(() => {
    if (name) {
      socketConnection.emit('name', name)
      setShowPopup(false)
    }
  }, [name])

  useEffect(() => {
    if (data) {
      setBoard(
        createBoard(data, totalSquares, setDownGroupings, setAcrossGroupings, setGuesses)
      )
    }
  }, [data])


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

  // Would display some awesome feel good banner
  useEffect(() => {
    if (guesses) {
      // Success!
      console.log('correct: ', grading.correct)
      console.log('grading black: ', grading.black)

      if (grading.correct === 225 - grading.black) {
        return setComplete(true)
      }
      // Incorrect answers
      if (grading.correct + grading.incorrect === guesses.length - grading.black) {
        return setComplete(false)
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

  const handleSendToSocket = (data) => {
    // add name to socket messages
    let body = data
    if (name) {
      body = { ...data, ...{ name } }
    }
    socketConnection.send(body);
  }

  // Username logic
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const checkName = (name) => {
    if (name.length <= 5) {
      setName(input)
    } else {
      setError(true)
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      checkName(input)
    }
  };

  const handleChange = (i) => {
    if (i.nativeEvent.data) {
      return setInput(input + i.nativeEvent.data)
    } else if (i.nativeEvent.data === null) {
      return setInput(input.slice(0, -1))
    }
  }

  if (!data || loading) {
    return (
      <div css={[styles.appBackground(darkmode), { height: '100vh' }]}>
        <Head>
          <title>WordVault (Loading...)</title>
          <link rel="icon" href="/favicon.ico" />
          <script src="https://unpkg.com/ionicons@5.2.3/dist/ionicons.js"></script>
        </Head>
        <div css={styles.loadingSpinner}>
          <div css={styles.loadingRing}><div></div><div></div></div>
          <p>Loading puzzle...</p>
        </div>
      </div>
    )
  } else {
    return (
      <div css={styles.appBackground(darkmode)}>
        <Head>
          <title>WordVault ({room ? room.slice(0, 1).toUpperCase() + room.substring(1) : '?'} room) </title>
          <script src="https://unpkg.com/ionicons@5.2.3/dist/ionicons.js"></script>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"></link>
          <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet"></link>
          <link href="https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"></link>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {name && complete &&
          <Popup>
            <h1>Crossword solved!</h1>
            {scores &&
              <ul css={styles.scores}>
                {calculateScores(scores)}
              </ul>
            }
            <br />
            <Button props={{ onClickFn: () => setComplete(false), darkmode: false, text: 'Back to puzzle', icon: { name: 'arrow-back-circle', size: 16 } }} />
          </Popup>
        }
        {!name &&
          <Popup>
            <h1>Enter a username</h1>
            <p>Must be <strong>5 or fewer</strong> letters.</p>
            <br />
            <input autoFocus onKeyDown={handleKeyDown} css={styles.textInput} value={input} onChange={(i) => handleChange(i)} placeholder='Username' type='text'></input>
            <Button props={{ onClickFn: () => checkName(input), darkmode: false, text: 'Save', icon: { name: 'checkmark-circle', size: 16 } }} />
          </Popup>
        }

        <Shortcuts props={{ show: showSidePanel, darkmode }} />
        <div css={{ borderBottom: `1px solid ${darkmode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`, zIndex: 2, position: 'absolute', width: '100%', height: '55px', top: 12, left: 0, right: 0, margin: 'auto' }}>
          <div css={{ padding: '0 32px' }}>
            <Players props={{ darkmode, setDarkmode, players }} />

            <div>
              <p css={{ maxWidth: 300, margin: 'auto', fontFamily: fonts.headline, fontWeight: 400, fontStyle: 'italic', letterSpacing: -3, fontSize: 36, textAlign: 'center', marginTop: 3 }}>Word Vault</p>
            </div>
          </div>
        </div>
        <div css={styles.appContainer}>


          <main css={{ marginTop: 8 }}>
            <Metadata props={{ data }} />
            <div css={styles.boardAndCluesContainer}>
              <Board props={{
                clientId,
                board,
                hoveredClue,
                showIncorrect,
                name,
                nametagLocations,
                nametagData,
                darkmode,
                data,
                newFocus,
                downGroupings,
                acrossGroupings,
                guestHighlights,
                clueIndex,
                movementDirection,
                setClueIndex,
                setMovementDirection,
                handleSendToSocket,
                guesses,
                setGuesses
              }}
              />

              <div css={styles.crosswordClues}>
                <h2 css={styles.clueHeader}>Across</h2>
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
              <div css={styles.crosswordClues}>
                <h2 css={styles.clueHeader}>Down</h2>
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
