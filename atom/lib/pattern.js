'use babel';

import lcm from 'compute-lcm'

export function fromString (raw) {
  if (raw.type === 'pattern') return raw

  console.log('parsing pattern', raw)

  const tokens = tokenize(raw)
  const values = parse(tokens)
  const pattern = getTimings(values)
  const pattern2 = calculateCycles(pattern)
  console.log('pattern2', pattern2)
  return pattern2
}

function parse (tokens, expectedEnd = null) {
  const result = []

  while (true) {
    if (tokens.length === 0) break

    const token = tokens.shift()

    if (token.type === 'value') {
      const num = parseFloat(token.value)
      result.push(num !== NaN ? num : token.value)
    } else if (token.type === 'control' && token.value === '[') {
      result.push({ type: 'subpattern', value: parse(tokens, ']') })
    } else if (token.type === 'control' && token.value === '<') {
      result.push({ type: 'cycle', value: parse(tokens, '>') })
    } else if (token.type === 'control' && token.value === expectedEnd) {
      break
    }
  }

  return result
}

function tokenize (raw) {
  const controlChars = ['[', ']', '<', '>']

  const tokens = []
  let buffer = ''
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]

    if (c === ' ') {
      if (buffer !== '') tokens.push({ type: 'value', value: buffer })
      buffer = ''
      continue
    }

    const isControlChar = controlChars.indexOf(c) !== -1
    if (isControlChar) {
      if (buffer !== '') tokens.push({ type: 'value', value: buffer })
      buffer = ''

      tokens.push({ type: 'control', value: c })
      continue
    }

    buffer += c
  }

  if (buffer !== '') tokens.push({ type: 'value', value: buffer })

  return tokens
}

// p(0, [0, 2, [3, [7, 8]], 12])

//  0 0.25   1/4
//  2 0.25   1/4
//  3 0.125  1/(4*2)
//  7 0.0625 1/(4*2*2)
//  8 0.0625 1/(4*2*2)
// 12 0.25   1/4


// p(1, [1, <2, 3, 4>, 5, <6, 7, 8, 9>])
//
// löst auf als
// 1 2 5 6
// 1 3 5 7
// 1 4 5 8
// 1 2 5 9
// 1 3 5 7
// 1 4 5 8
// 1 2 5 9
// 1 3 5 6
// 1 4 5 7
// 1 2 5 8
// 1 3 5 9
// 1 4 5 6
// 1 2 5 7
// 1 3 5 8
// 1 4 5 9
//
// pattern ende
// 1 2 5 6

function getTimings (pattern, index = 0, lengthFactor = 1) {
  let items = []
  for (let i = 0; i < pattern.length; i++) {
    const length = 1 / (pattern.length * lengthFactor)
    const value = pattern[i]

    if (value.type === 'subpattern') {
      const subpattern = getTimings(value.value, index, pattern.length * lengthFactor)
      items = items.concat(subpattern.items)
      index += value.length
    } else if (value.type === 'cycle') {
      items.push({ type: 'cycle', length, value: value.value })
    } else {
      items.push({ type: 'value', length, value })
      index++
    }
  }

  return { type: 'pattern', items }
}

function calculateCycles (pattern) {
  console.log('pattern', pattern)

  const newItems = []
  const cycleLengths = pattern.items
    .filter(item => item.type === 'cycle')
    .map(item => item.value.length)
  const newItemsLength = (cycleLengths.length === 1 ? cycleLengths[0] : lcm(cycleLengths)) * pattern.items.length
  console.log('cycleLengths', cycleLengths)
  console.log('pattern.items.length', pattern.items.length)
  console.log('newItemsLength', newItemsLength)

  for (let i = 0; i < newItemsLength; i++) {
    const item = pattern.items[i % pattern.items.length]
    const cycleIndex = Math.floor(i / pattern.items.length)

    if (item.type === 'value') {
      newItems.push(item)
    } else if (item.type === 'cycle') {
      newItems.push({
        type: 'value',
        length: item.length,
        value: item.value[cycleIndex % item.value.length]
      })
    }
  }

  return { type: 'pattern', items: newItems }
}
