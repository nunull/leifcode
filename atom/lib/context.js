'use babel';

import { sendPattern } from './osc'
import { fromString } from './pattern'

export function p (channel, rawPattern) {
  console.log('p', channel, rawPattern)
  const pattern = fromString(rawPattern)
  sendPattern(channel, pattern).catch(err => {
    console.log('error sending pattern', err)
  })
}

export function plus (p1, p2) {
  p1 = fromString(p1)
  p2 = fromString(p2)

  const newItems = []

  for (let n = 0; n < p1.items.length; n++) {
    for (let m = 0; m < p2.items.length; m++) {
      newItems.push({
        type: 'value',
        length: p2.items[m].length,
        value: p1.items[n].value + p2.items[m].value
      })
    }
  }

  return { type: 'pattern', items: newItems }
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
    sendPattern(i, { type:"pattern", items: []}).catch(err => {
      console.log('error sending pattern', err)
    })
  }
}
