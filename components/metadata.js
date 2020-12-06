
/** @jsx jsx */

import { jsx } from '@emotion/react'

export default function Metadata({ props }) {
  const {
    data
  } = props

  return (
    <p css={{ marginBottom: -8, padding: 0 }}>{data ? `${data.dow}, ${data.date} • ${data.editor} (Editor) • ${data.author} (Author)` : 'Retrieving puzzle details...'}</p>
  )
}