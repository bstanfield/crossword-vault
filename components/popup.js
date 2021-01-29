
/** @jsx jsx */

import { useState } from 'react'
import { jsx } from '@emotion/react'
import { fonts, scale, colors } from '../lib/helpers'
import Button from './button'

export default function Popup({ children }) {

  const darkBackground = (opacity) => scale({
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: `rgba(0, 0, 0, ${opacity || 0.5})`,
    zIndex: 8,
  })

  const container = scale({
    borderRadius: 8,
    textAlign: 'center',
    width: '90%',
    maxWidth: 600,
    height: 'auto',
    maxHeight: 600,
    zIndex: 9,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    margin: 'auto',
  })

  const content = scale({
    width: '100%',
    height: 'auto',
    backgroundColor: 'white',
    padding: '60px',
    position: 'relative',
    margin: 'auto',
    marginTop: 80,
    borderRadius: 6,
    h1: {
      margin: 0,
      paddingBottom: 8,
    },
  })

  // Find better thing for this
  // if (insufficientWidth && !showPopup) {
  //   return (
  //     <div css={darkBackground(1)}>
  //       <div css={container}>
  //         <div css={{ position: 'relative', width: '100%', height: '100%' }}>
  //           <div css={content}>
  //             <h1>🙈 Oops! Your screen is too small to play.</h1>
  //             <p>WordVault doesn't support mobile or slim browser widths just yet. Please widen your browser!</p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }


  return (
    <div css={darkBackground(0.5)}>
      <div css={container}>
        <div css={{ position: 'relative', width: '100%', height: '100%' }}>
          <div css={content}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}