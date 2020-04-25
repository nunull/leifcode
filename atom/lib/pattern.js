'use babel';

export function fromString (raw) {
  if (raw.type === 'pattern') return raw

  console.log('parsing pattern', raw)

  const tokens = tokenize(raw)
  const values = parse(tokens)
  return getTimings(values)
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
      result.push(parse(tokens, ']'))
    } else if (token.type === 'control' && token.value === '<') {
      result.push(parse(tokens, '>'))
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

function getTimings (pattern, index = 0, lengthFactor = 1) {
  let items = []
  for (let i = 0; i < pattern.length; i++) {
    const length = 1 / (pattern.length * lengthFactor)
    const value = pattern[i]

    if (Array.isArray(value)) {
      const subpattern = getTimings(value, index, pattern.length * lengthFactor)
      items = items.concat(subpattern.items)
      index += value.length
    } else {
      items.push({ type: 'value', length, value })
      index++
    }
  }

  return { type: 'pattern', items }
}
