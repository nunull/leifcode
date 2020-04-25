'use babel';

import { sendPattern } from './osc'
import { fromString } from './pattern'

export function p (channel, rawPattern) {
  const pattern = fromString(rawPattern)
  sendPattern(channel, pattern)
}

export function plus (value, rawPattern) {
  const pattern = fromString(rawPattern)
  for (const item of pattern.items) {
    item.value += value
  }
  return pattern
}

export function slow (factor, rawPattern) {
  const pattern = fromString(rawPattern)
  for (const item of pattern.items) {
    item.length *= factor
  }
  return pattern
}

export function rev (rawPattern) {
  const pattern = fromString(rawPattern)
  pattern.items = pattern.items.reverse()
  return pattern
}

export function hush () {
  for (let i = 0; i < 10; i++) {
    sendPattern(i, [])
  }
}
