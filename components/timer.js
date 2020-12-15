/** @jsx jsx */

import { jsx } from '@emotion/react'
import { scale } from '../lib/helpers'
import { useEffect, useState } from 'react'

const timerStyles = () => scale({
  display: 'inline-block',
  margin: 0,
  padding: 8,
  backgroundColor: '#333',
  fontSize: 13,
  color: '#f5f5f5',
  borderRadius: 2,
  fontFamily: 'JetBrains Mono, monospace',
  marginRight: 12,
})

export default function Timer({ props }) {
  const {
    timer,
    grading
  } = props

  const formatTime = (seconds) => {
    let hours = 0
    let minutes = Math.floor(seconds / 60)
    let remainingSeconds = 0

    if (seconds < 60) {
      minutes = 0
      remainingSeconds = seconds
    } else {
      minutes = Math.floor(seconds / 60)
      remainingSeconds = seconds % 60 % 60
    }

    if (minutes > 60) {
      hours = Math.floor(minutes / 60)
      minutes = Math.floor(minutes % 60 / 100 * 60)
      remainingSeconds = seconds % 60 % 60
    }


    if (remainingSeconds === 60) {
      remainingSeconds = 0
    }

    let leadingSecond = ''
    let leadingMinute = ''
    let leadingHour = ''

    if (Math.round(remainingSeconds) < 10) {
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
    <p css={timerStyles}>{timer ? formatTime(timer) : '--:--:--'}</p>
  )
}