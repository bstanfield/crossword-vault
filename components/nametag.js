
/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'

export default function Nametag({ props }) {
  const {
    guestHighlight,
    nametagData,
    colorLookup,
    nametagLocations,
    content,
    name,
    darkmode,
    clientId,
    focus,
  } = props


  const getNametag = (position) => {
    const nametagDataWithoutLocalClient = nametagData.filter(tag => tag.id !== clientId)
    const nametagObject = nametagDataWithoutLocalClient.filter(tag => tag.location === position)[0]

    if (nametagObject) {
      return nametagObject
    }
    // placeholder
    return { color: 'transparent' }
  }

  const nametag = (darkmode, color) => scale({
    fontSize: 8,
    fontWeight: 600,
    position: 'absolute',
    backgroundColor: darkmode ? colorLookup[color].dark_high : colorLookup[color].high,
    color: 'white !important',
    padding: '1px 4px',
    top: '-12px !important',
    left: '-2px !important',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  })

  // First, check if there is a guest or local client on this square
  if (guestHighlight || focus) {
    if (focus) {
      return (
        <span css={nametag(darkmode, 'grey')}>{name}</span>
      )
    }
    console.log('guestHighlight: ', guestHighlight)
    // Then, check if this square is the beginning of the clue
    const index = nametagLocations.indexOf(content.position)
    if (index > -1) {
      return (
        <span css={nametag(darkmode, getNametag(content.position).color)}>{getNametag(content.position).name}</span>
      )
    }
    return null
  } else {
    return null
  }
}