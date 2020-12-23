import { useEffect, useState, Fragment } from 'react'

export default function Index() {
  const [key, setKey] = useState('')

  const checkKey = async (key) => {
    const res = await fetch(`http://localhost:4001/secret?key=${key}`)
    const data = await res.json()
    if (data.error) {
      alert('Invalid key')
    } else {
      alert('Welcome!')
    }
  }

  return (
    <div>
      <h1>Enter your key</h1>
      <input value={key} onChange={(i) => setKey(key + i.nativeEvent.data)} placeholder="Your key" type="text"></input>
      <button onClick={() => checkKey(key)}>Enter</button>
    </div >
  )
}