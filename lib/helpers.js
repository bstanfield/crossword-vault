import { css } from '@emotion/react';
import facepaint from 'facepaint';

// Media queries and Emotion CSS
export const mq = facepaint([
  '@media(min-width: 420px)',
  '@media(min-width: 720px)',
  '@media(min-width: 1000px)',
  '@media(min-width: 1500px)',
]);

export const scale = (x) => css(mq(x));