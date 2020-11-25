/** @jsx jsx */

import { jsx } from '@emotion/react'
import styles from '../styles/Home.module.css'
import classNames from 'classnames'
import { scale } from '../lib/helpers'


const blockNumber = (hover) => scale({
  fontWeight: hover ? 800 : 400,
  fontSize: hover ? 12 : 10,
});

const squareInput = () => scale({
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
})

const squareBox = (content, filled, highlightedSquares) => scale({
  "margin": "0",
  "padding": "0",
  "marginLeft": "-2px",
  "marginBottom": "-2px",
  "border": (filled || highlightedSquares.includes(content.position)) ? '2px solid orange' : '2px solid black',
  zIndex: (filled || highlightedSquares.includes(content.position)) ? 2 : 1,
  "color": "#333333"
})

export default function Square({ props }) {
  const {
    content,
    hoveredClue,
    highlightedSquares,
    selectedSquare,
    filledInput,
    setSelectedSquare,
    setFilledInput
  } = props

  // console.log('content: ', content)
  // console.log('perfect content: ', JSON.stringify({
  //   grouping: [0, 1, 2, 3],
  //   clueId: 1,
  //   blockNumber: null,
  //   letter: 'G',
  //   position: 2,
  //   guess: null,
  // }))

  const hover = content.number === Number(hoveredClue)

  return (
    <div id={content.position} css={squareBox(content, filledInput === content.position, highlightedSquares)} className={classNames(styles.crossword_board__square, content.letter === '.' ? styles.crossword_board__square__block : styles.crossword_board__square__letter)}>
      {content.number > 0 && <span css={blockNumber(hover)}>{content.number}</span>}
      {/* <span css={blockNumber(hover)}>{content.position - 1}</span> */}
      {content.letter !== '.' && <input autoComplete='off' onFocus={() => setSelectedSquare(content.position)} onClick={() => setSelectedSquare(content.position)} css={squareInput} type="text" id={`input-${content.position}`} onChange={(input) => { if (input.nativeEvent.data) setFilledInput(content.position) }} name={content.letter} maxLength={1} />}
    </div>
  )
}