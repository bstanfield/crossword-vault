/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'
import { useEffect, useState } from 'react'

export default function Timer({ props }) {
  const {
    timer
  } = props

  const formatTime = (seconds) => {
    let hours = 0
    let minutes = Math.floor(seconds / 60)
    let remainingSeconds = 0
    if (minutes > 60) {
      hours = Math.floor(minutes / 60)
      minutes = Math.floor(minutes % 60 / 100 * 60)
      remainingSeconds = seconds % 60 / 100 * 60
    }
    if (seconds < 60) {
      minutes = 0
      remainingSeconds = seconds
    } else {
      minutes = Math.floor(seconds / 60)
      remainingSeconds = seconds % 60 % 60
    }

    let leadingSecond = ''
    let leadingMinute = ''
    let leadingHour = ''

    if (remainingSeconds < 10) {
      leadingSecond = 0
    }
    if (minutes < 10) {
      leadingMinute = 0
    }
    if (hours < 10) {
      leadingHour = 0
    }

    return `${leadingHour}${hours}:${leadingMinute}${minutes}:${leadingSecond}${Math.round(remainingSeconds)}`
  }

  return (
    <p>{timer ? formatTime(timer) : 'Retrieving time...'}</p>
  )
}