
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
    darkmode,
    clientId,
  } = props


  const getNametag = (position) => {
    const nametagObject = nametagData.filter(tag => tag.location === position)[0]
    if (nametagObject) {
      return nametagObject
    }
    // placeholder
    return { color: 'red' }
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

  // First, check if there is a guest on this square
  if (guestHighlight) {
    // Then, check if this square is the beginning of the clue
    const index = nametagLocations.indexOf(content.position)
    if (index > -1) {
      // Lastly, make sure the nametag is from *another* client
      if (guestHighlight.id !== clientId) {
        return (
          <span css={nametag(darkmode, getNametag(content.position).color)}>{getNametag(content.position).name}</span>
        )
      }
    }
    return null
  } else {
    return null
  }
}