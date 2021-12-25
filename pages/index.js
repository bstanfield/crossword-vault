/** @jsx jsx */

import { useEffect, useState, Fragment } from 'react'
import { jsx } from '@emotion/react'
import Head from 'next/head'
import { scale, fonts, colors, ENDPOINT } from '../lib/helpers'
import Button from '../components/button'

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

export default function Index() {
  const [key, setKey] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (success) {
      window.location.href = `/${key}`
    }
  }, [success])

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      checkKey(key)
    }
  };

  const checkKey = async (key) => {
    const res = await fetch(`${ENDPOINT}/secret?key=${key}`)
    const data = await res.json()
    if (data.error) {
      alert('Invalid key')
      setKey('')
    } else {
      setSuccess(true)
    }
  }

  const handleChange = (i) => {
    if (i.nativeEvent.data) {
      return setKey(key + i.nativeEvent.data)
    } else if (i.nativeEvent.data === null) {
      return setKey(key.slice(0, -1))
    }
  }

  return (
    <Fragment>
      <Head>
        <title>WordVault</title>
        <meta property="og:image" content="https://i.imgur.com/NfmSRhc.png" />
        <meta property="og:description" content="Solve crosswords, collaboratively. Play by yourself, or with up to twenty friends!" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script type="module" src="https://unpkg.com/ionicons@5.2.3/dist/ionicons/ionicons.esm.js"></script>
        <script noModule="" src="https://unpkg.com/ionicons@5.2.3/dist/ionicons/ionicons.js"></script>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"></link>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet"></link>
        <link href="https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"></link>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div css={{ textAlign: 'center', position: 'absolute', top: '60vh', bottom: 0, right: 0, left: 0, margin: 'auto' }}>
        <h1>Enter your key</h1>
        <input autoFocus onKeyDown={handleKeyDown} css={textInput} value={key} onChange={(i) => handleChange(i)} placeholder="Your key" type="text"></input>
        <Button props={{ onClickFn: () => checkKey(key), darkmode: false, text: 'Enter', icon: { name: 'enter-outline', size: 16 } }} />
      </div >
    </Fragment>
  )
}