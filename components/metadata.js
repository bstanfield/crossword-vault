
/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'

const fancyHeader = scale({
  fontSize: 20,
  margin: 0,
})

const getOrdinal = (i) => {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

const formatDate = (date) => {
  // takes in 5/26/2000 --> May 26, 2000
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const splits = date.split('/')
  const month = months[splits[0]]
  const day = splits[1]
  const year = splits[2]

  const ordinal = getOrdinal(day)

  return `${month} ${ordinal}, ${year}`
}

export default function Metadata({ props }) {
  const {
    data
  } = props

  return (
    <div>
      <h1 css={fancyHeader}>{data && `${data.dow}, ${formatDate(data.date)}`}</h1>
      <p css={{ padding: 0, marginTop: 8, marginBottom: -8 }}>{data ? `${data.editor} (Editor) • ${data.author} (Author)` : 'Retrieving puzzle details...'}</p>
    </div>
  )
}