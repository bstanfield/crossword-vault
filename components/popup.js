
/** @jsx jsx */

import { useState } from 'react'
import { jsx } from '@emotion/react'
import { fonts, scale, colors } from '../lib/helpers'
import Button from './button'

export default function Popup({ props }) {
  const {
    insufficientWidth = true,
    showPopup,
    setName,
  } = props

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

  const darkBackground = (opacity) => scale({
    display: showPopup ? 'block' : ['block', 'block', 'none', 'none'],
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: `rgba(0, 0, 0, ${opacity || 0.5})`,
    zIndex: 8,
  })

  const container = scale({
    borderRadius: 8,
    textAlign: 'center',
    backgroundColor: 'white',
    width: '90%',
    maxWidth: 600,
    height: '90%',
    maxHeight: 300,
    zIndex: 9,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    margin: 'auto',
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

  const content = scale({
    width: '80%',
    height: 'fit-content',
    maxHeight: 250,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    margin: 'auto',
    h1: {
      margin: 0,
      paddingBottom: 8,
    },
    'p:first-of-type': {
      color: error ? colors.error : colors.slate,
      margin: 0,
    }
  })

  if (insufficientWidth && !showPopup) {
    return (
      <div css={darkBackground(1)}>
        <div css={container}>
          <div css={{ position: 'relative', width: '100%', height: '100%' }}>
            <div css={content}>
              <h1>🙈 Oops! Your screen is too small to play.</h1>
              <p>WordVault doesn't support mobile or slim browser widths just yet. Please widen your browser!</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showPopup) {
    return (
      <div css={darkBackground(0.5)}>
        <div css={container}>
          <div css={{ position: 'relative', width: '100%', height: '100%' }}>
            <div css={content}>
              <h1>Enter a username</h1>
              <p>Must be <strong>5 or fewer</strong> letters.</p>
              <br />
              <input autoFocus onKeyDown={handleKeyDown} css={textInput} value={input} onChange={(i) => handleChange(i)} placeholder='Username' type='text'></input>
              <Button props={{ onClickFn: () => checkName(input), darkmode: false, text: 'Save', icon: { name: 'checkmark-circle', size: 16 } }} />
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return null
  }

}