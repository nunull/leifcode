const { Client } = require('node-osc')
const util = require('util')

const client = new Client('127.0.0.1', 3333)
const send = util.promisify(client.send.bind(client))

async function sendOsc (path, message) {
  console.log(path, message)
  await send(path, message)
}

main()

async function main () {
  await sendPattern(0, [0, 2, [3, 7], 12])
  await sendPattern(1, [0, [[7, 7, 8, 14, [15, 19]], 0, 2, 3, 5], 12])
  await sendPattern(2, [0, [0, 2], 0, [6, 3]])
  client.close()
}

async function sendPattern (channel, pattern) {
  await sendOsc(`/pattern/${channel}/clear`, 'bang')
  await sendItems(channel, pattern)
  await sendOsc(`/pattern/${channel}/dump`, 'bang')
}

async function sendItems (channel, pattern, offset = 0, lengthFactor = 1) {
  let index = offset
  for (let i = 0; i < pattern.length; i++) {
    const length = 1 / pattern.length * lengthFactor
    const value = pattern[i]

    if (Array.isArray(value)) {
      await sendItems(channel, value, index, 1 / pattern.length)
      index += value.length
    } else {
      await sendOsc(`/pattern/${channel}/set`, [index + 1, length, value + 36])
      index++
    }
  }
}
