import { css } from '@emotion/react';
import facepaint from 'facepaint';

export const ENDPOINT = process.env.NODE_ENV === 'production'
  ? 'https://multiplayer-crossword-server.herokuapp.com'
  : 'http://127.0.0.1:4001'

// export const ENDPOINT = 'https://multiplayer-crossword-server.herokuapp.com'
// export const ENDPOINT = 'https://wordvault-pr-8.herokuapp.com'

export const fonts = {
  serif: '',
  sans: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
  monospace: 'JetBrains Mono, monospace',
  headline: 'Old Standard TT, Serif',
}

export const colors = {
  slate: '#333',
  lightgrey: '#eee',
  mediumgrey: '#d2d2d2',
  offwhite: '#f5f5f5',
  error: '#e61818',
  success: 'green',
}

// Media queries and Emotion CSS
export const mq = facepaint([
  '@media(min-width: 520px)',
  '@media(min-width: 750px)',
  '@media(min-width: 1100px)',
  '@media(min-width: 1500px)',
]);

export const scale = (x) => css(mq(x));

export const formatTime = (seconds) => {
  let days = 0
  let hours = 0
  let minutes = Math.floor(seconds / 60)
  let remainingSeconds = 0

  if (seconds < 60) {
    minutes = 0
    remainingSeconds = seconds
  } else {
    minutes = Math.floor(seconds / 60)
    remainingSeconds = seconds % 60 % 60
  }

  if (minutes > 60) {
    hours = Math.floor(minutes / 60)
    minutes = Math.floor(minutes % 60 / 100 * 60)
    remainingSeconds = seconds % 60 % 60
  }


  if (remainingSeconds === 60) {
    remainingSeconds = 0
  }

  let leadingSecond = ''
  let leadingMinute = ''
  let leadingHour = ''

  if (Math.round(remainingSeconds) < 10) {
    leadingSecond = 0
  }
  if (minutes < 10) {
    leadingMinute = 0
  }
  if (hours < 10) {
    leadingHour = 0
  }

  if (hours > 24) {
    days = hours / 24
    return `${Math.floor(days)} day${days > 1 ? 's' : ''} and ${hours % 24} hour${hours > 1 ? 's' : ''}`
  }

  return `${hours > 0 ? `${leadingHour}${hours} hour(s),` : ''} ${leadingMinute}${minutes} minutes, and ${leadingSecond}${Math.round(remainingSeconds)} seconds`
}