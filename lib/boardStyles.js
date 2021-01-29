/** @jsx jsx */

import { jsx, keyframes } from '@emotion/react'
import { scale, colors, fonts } from '../lib/helpers'

const width = 15
const height = 15
const totalSquares = width * height

const spinnerAnimation = keyframes`
0% {
  transform: rotate(0deg);
}
100% {
  transform: rotate(360deg);
}
`

const loadingRing = scale({
  display: 'inline-block',
  position: 'relative',
  width: '80px',
  height: '80px',
  div: {
    boxSizing: 'border-box',
    display: 'block',
    position: 'absolute',
    width: '64px',
    height: '64px',
    margin: '8px',
    border: '8px solid #333',
    borderRadius: '50%',
    animation: `${spinnerAnimation} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite`,
    borderColor: '#333 transparent transparent transparent',
  },
  'div:nth-child(1)': {
    animationDelay: '-0.45s',
  },
  'div:nth-child(2)': {
    animationDelay: '-0.3s',
  },
  'div:nth-child(3)': {
    animationDelay: '-0.15s',
  },
})

const textInput = scale({
  padding: '8px 9px 8px 9px',
  border: `1px solid ${colors.slate}`,
  borderRadius: 2,
  marginRight: 12,
  fontFamily: fonts.monospace,
  '&::placeholder': {
    fontFamily: fonts.monospace,
  }
})

const clueHeader = scale({
  marginTop: 30,
  paddingBottom: 6,
  borderBottom: `1.5px solid ${colors.mediumgrey}`,
})

const appContainer = scale({
  height: '100vh',
  padding: '0px 10px',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '90px',
  alignItems: 'center',
  margin: 'auto',
  position: 'relative',
})

const boardAndCluesContainer = scale({
  display: 'grid',
  gridGap: '30px',
  gridTemplateColumns: ['6fr 2fr 2fr', '6fr 2fr 2fr', '6fr 2fr 2fr', '4fr 2fr 2fr'],
  maxWidth: '1200px',
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
  height: 'auto',
  // maxWidth: 550,
  backgroundColor: colors.slate,
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

const scores = scale({
  textAlign: 'left',
  maxWidth: '450px',
  listStyle: 'none',
  li: {
    padding: '8px 0px',
    borderBottom: '1px solid #eee',
  }
})

module.exports = {
  loadingSpinner,
  appBackground,
  loadingRing,
  clueHeader,
  appContainer,
  boardAndCluesContainer,
  boardContainer,
  crosswordClues,
  textInput,
  scores,
}
