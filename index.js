const { Client } = require('node-osc')
const util = require('util')

const client = new Client('127.0.0.1', 3333)
const send = util.promisify(client.send.bind(client))

sendPattern([0, 2, [3, 7]])
// /pattern/set 1 0.33 0
// /pattern/set 2 0.33 1
// /pattern/set 3 0.165 2
// /pattern/set 4 0.165 3

async function sendPattern (pattern) {
  await send('/pattern/clear', 'bang')
  await sendItems(pattern)
  await send('/pattern/dump', 'bang')

  client.close()
}

async function sendItems (pattern, offset = 0, lengthFactor = 1) {
  for (let i = 0; i < pattern.length; i++) {
    const index = i + offset + 1
    const length = 1 / pattern.length * lengthFactor
    const value = pattern[i]

    if (Array.isArray(value)) {
      await sendItems(value, i, 1 / pattern.length)
    } else {
      await send('/pattern/set', [index, length, value + 36])
    }
  }
}
