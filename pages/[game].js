/** @jsx jsx */

import { jsx } from '@emotion/react'
import { fonts, ENDPOINT, formatTime } from '../lib/helpers'
import Head from 'next/head'
import { Fragment, useEffect, useState } from 'react'
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
import DateSelector from '../components/DateSelector'
import Board from '../components/board'
import styles from '../lib/boardStyles'
import Icon from '../components/icon'

// board ratios (temp hardcode)
const width = 15
const height = 15
const totalSquares = width * height

// Takes data from backend and neatens it up
const calculateScores = (timestamp, completedAtTimestamp, scores) => {
  // Hotstreak
  let hotStreakScores = {}
  for (const [key, val] of Object.entries(scores.hotStreak)) {
    const highScore = val.reduce((i, x) => {
      if (!i) return x;
      if (x > i) return x;
      return i;
    })
    hotStreakScores[key] = highScore;
  }
  let highScoreHotStreak = { name: '', score: 0 }
  for (const [key, val] of Object.entries(hotStreakScores)) {
    if (val > highScoreHotStreak.score) {
      highScoreHotStreak = { name: key, score: val }
    }
  }

  // Marksman
  let marksmanScores = {}
  for (const [key, val] of Object.entries(scores.highestAccuracy)) {
    const accuracy = val.correct / (val.correct + val.incorrect)
    marksmanScores[key] = accuracy;
  }

  let highscoreAccuracy = { name: '', score: 0 }
  for (const [key, val] of Object.entries(marksmanScores)) {
    if (Math.round(val * 100) > highscoreAccuracy.score) {
      highscoreAccuracy = { name: key, score: Math.round(val * 100) }
    }
  }

  // Tough letters
  let highscoreToughLetters = { name: '', score: 0 }
  for (const [key, val] of Object.entries(scores.toughLetters)) {
    if (val > highscoreToughLetters.score) {
      highscoreToughLetters = { name: key, score: val }
    }
  }

  // Thief
  let highscoreThief = { name: '', score: 0 }
  for (const [key, val] of Object.entries(scores.thief)) {
    if (val > highscoreThief.score) {
      highscoreThief = { name: key, score: val }
    }
  }

  // Benchwarmer
  let lowscoreBenchwarmer = { name: '', score: 0 }
  for (const [key, val] of Object.entries(scores.benchwarmer)) {
    if (lowscoreBenchwarmer.score === 0) {
      lowscoreBenchwarmer = { name: key, score: val }
    } else {
      if (val < lowscoreBenchwarmer.score) {
        lowscoreBenchwarmer = { name: key, score: val }
      }
    }
  }

  // Workhorse
  let highscoreWorkhorse = { name: '', score: 0 }
  if (scores.workhorse) {
    for (const [key, val] of Object.entries(scores.workhorse)) {
      if (highscoreWorkhorse.score === 0) {
        highscoreWorkhorse = { name: key, score: val }
      } else {
        if (val > highscoreWorkhorse.score) {
          highscoreWorkhorse = { name: key, score: val }
        }
      }
    }
  }

  // Editor
  let highscoreEditor = { name: '', score: 0 }
  if (scores.editor) {
    for (const [key, val] of Object.entries(scores.editor)) {
      if (highscoreEditor.score === 0) {
        highscoreEditor = { name: key, score: val }
      } else {
        if (val > highscoreEditor.score) {
          highscoreEditor = { name: key, score: val }
        }
      }
    }
  }

  const minutesHoursOrDaysToComplete = (timestamp, completedAtTimestamp) => {
    // startDate = beginning of crossword
    const startDate = new Date(timestamp)
    const completedAt = new Date(completedAtTimestamp)

    const secondsToComplete = (completedAt.getTime() - startDate.getTime()) / 1000;
    return formatTime(secondsToComplete);
  }

  return (
    <Fragment>
      {completedAtTimestamp && <li><Icon props={{ color: 'orange', name: 'stopwatch', size: 18, height: 14 }} />Completed in: {minutesHoursOrDaysToComplete(timestamp, completedAtTimestamp)}</li>}
      <li><Icon props={{ color: 'red', name: 'flame', size: 16, height: 14 }} /><strong>{highScoreHotStreak.name}:</strong> &ldquo;Hotstreak&rdquo; ({highScoreHotStreak.score} correct letters in a row)</li>
      {(highscoreAccuracy.score > 50 && highscoreAccuracy.score < 100) && <li><Icon props={{ color: 'green', name: 'disc', size: 16, height: 14 }} /><strong>{highscoreAccuracy.name}:</strong> &ldquo;Marksman&rdquo; ({highscoreAccuracy.score}% accuracy)</li>}
      {highscoreAccuracy.score > 99 && <li><Icon props={{ color: 'green', name: 'shield-checkmark', size: 16, height: 14 }} /><strong>{highscoreAccuracy.name}:</strong> &ldquo;Perfectionist&rdquo; (100% accuracy)</li>}

      {highscoreThief.score > 2 && <li><Icon props={{ color: 'purple', name: 'sad', size: 16, height: 14 }} /><strong>{Object.keys(scores.thief)[0]}:</strong> &ldquo;Thief&rdquo; (Answered the last letter of {Object.values(scores.thief)[0]} words)</li>}
      {highscoreToughLetters.score >= 4 && <li><Icon props={{ color: 'navy', name: 'school', size: 16, height: 14 }} /><strong>{highscoreToughLetters.name}:</strong> &ldquo;Tough Letters&rdquo; ({highscoreToughLetters.score} X, Y, or Z letters)</li>}
      {lowscoreBenchwarmer.score < 35 && lowscoreBenchwarmer.score > 0 && <li><Icon props={{ color: 'skyblue', name: 'snow', size: 16, height: 14 }} /><strong>{lowscoreBenchwarmer.name}:</strong> &ldquo;Still warming up...&rdquo; (Only {lowscoreBenchwarmer.score} correct letters)</li>}
      {highscoreWorkhorse.score > 75 && <li><Icon props={{ color: 'purple', name: 'barbell', size: 16, height: 14 }} /><strong>{highscoreWorkhorse.name}:</strong> &ldquo;Heavy lifter&rdquo; ({highscoreWorkhorse.score} correct answers)</li>}
      {highscoreEditor.score > 2 && <li><Icon props={{ color: 'red', name: 'medical', size: 18, height: 14 }} /><strong>{highscoreEditor.name}:</strong> &ldquo;Medic&rdquo; (Fixed {highscoreEditor.score} incorrect guesses)</li>}

      {/* <li css={{ marginTop: 6 }}><Icon props={{ color: 'green', name: 'leaf', size: 16, height: 14 }} /><strong css={{ color: 'green' }}>Crossword for Climate</strong><br /><div css={{ marginLeft: 24, marginTop: 4, marginBottom: 8, lineHeight: 1.5 }}>$0.50 contributed to the Wren Climate Fund as a reward for finishing a crossword on Word Vault!</div></li> */}
    </Fragment >
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
  const [dateRange, setDateRange] = useState(false)
  const [currentClueText, setCurrentClueText] = useState(false)

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
  const [completedAtTimestamp, setCompletedAtTimestamp] = useState(false)
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

    connection.on('completed', time => {
      setCompletedAtTimestamp(time)
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
    // TODO: Is this slowing down app/firing too often?
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
    // If username is in storage, don't ask again
    if (localStorage.getItem('username')) {
      setName(localStorage.getItem('username'))
      setShowPopup(false)
    }
    if (!name) {
      setShowPopup(true)
    }

    // If darkmode is in storage, default to it
    // localstorage boolean gets saved as string :(
    if (localStorage.getItem('darkmode').includes('true')) {
      setDarkmode(true)
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
      if (grading.correct === 225 - grading.black) {
        return setComplete(true)
      }
      // Incorrect answers
      if (grading.correct + grading.incorrect === guesses.length - grading.black) {
        return setComplete(false)
      }
    }
  }, [grading])

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
      localStorage.setItem('username', input)
      setError(false)
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
          <title>WordVault</title>
          <meta property="og:image" content="https://i.imgur.com/NfmSRhc.png" />
          <meta property="og:description" content="Solve crosswords, collaboratively. Play by yourself, or with up to twenty friends!" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <link rel="icon" href="/favicon.ico" />
          <script src="https://unpkg.com/ionicons@5.2.3/dist/ionicons.js"></script>
        </Head>
        <div css={styles.loadingSpinner}>
          <div css={styles.loadingRing}><div></div><div></div></div>
          {name ? <p>Joining puzzle as <b>{name}</b>...</p> : <p>Loading puzzle...</p>}
        </div>
      </div>
    )
  } else {
    return (
      <div css={styles.appBackground(darkmode)}>
        <Head>
          <title>WordVault ({room ? room.slice(0, 1).toUpperCase() + room.substring(1) : '?'} room) </title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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
                {calculateScores(timestamp, completedAtTimestamp, scores)}
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
          {error && <p css={{ fontSize: 14, padding: 0, color: 'red' }}>Too many letters!</p>}
          </Popup>
        }

        <Shortcuts props={{ show: showSidePanel, darkmode }} />
        <div css={{ borderBottom: `1px solid ${darkmode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`, zIndex: 2, position: 'absolute', width: '100%', height: '50px', top: 12, left: 0, right: 0, margin: 'auto' }}>
          <div css={styles.navContainer}>
            <Players props={{ darkmode, setDarkmode, players, socketConnection }} />

            <div>
              <p css={styles.logo}>Word Vault</p>
            </div>
          </div>
        </div>
        <div css={styles.appContainer}>


          <main>
            <Metadata props={{ data }} />
            <p css={styles.mobileClueCard(darkmode)} dangerouslySetInnerHTML={{ __html: currentClueText }} />
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
                        setFocus,
                        setCurrentClueText
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
                        setFocus,
                        setCurrentClueText
                      }}
                    />
                  ))}
                </ul>
              </div>
            </div>

            {/* <Timer props={{ timer, grading }} /> */}

            <div css={{ marginTop: 6 }}>
              <Alert props={{ guesses, grading, showIncorrect, setShowIncorrect, setComplete }} />
              <span css={{ marginRight: 8 }} onClick={() => setShowSidePanel(showSidePanel ? false : true)}>
                <Button props={{ darkmode, text: 'Shortcuts', icon: { name: 'flash', size: 14 } }} />
              </span>

              <span css={{ marginRight: 8 }}>
                <DateSelector
                  props={{
                    darkmode,
                    socketConnection,
                    dateRange,
                    setDateRange,
                  }}
                />
              </span>

              <PuzzleSelector
                props={{
                  darkmode,
                  dateRange,
                  socketConnection
                }}
              />

              <p css={{ display: 'inline-block', fontSize: 14, paddingLeft: 12, paddingRight: 4 }}>Playing as <strong>{name || 'anon'}</strong></p><a css={{ fontSize: 14, color: darkmode ? '#8e8e8e' : 'blue', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setName(false)}>edit</a>
            </div>
          </main>
        </div>
      </div >
    )
  }
}
