import { css } from '@emotion/react';
import facepaint from 'facepaint';

export const ENDPOINT = process.env.NODE_ENV === 'production'
  ? 'https://multiplayer-crossword-server.herokuapp.com/'
  : 'http://127.0.0.1:4001'

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
  '@media(min-width: 420px)',
  '@media(min-width: 720px)',
  '@media(min-width: 1000px)',
  '@media(min-width: 1500px)',
]);

export const scale = (x) => css(mq(x));