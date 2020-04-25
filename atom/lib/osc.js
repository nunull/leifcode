'use babel';

export async function sendPattern (channel, pattern) {
  await sendOsc(`/pattern/${channel}/clear`, 'bang')
  await sendItems(channel, pattern.items)
  await sendOsc(`/pattern/${channel}/dump`, 'bang')
}

async function sendItems (channel, items, index = 1) {
  for (const item of items) {
    await sendOsc(`/pattern/${channel}/set`, [index, item.length, item.value])
    index++
  }
  return index
}

async function sendOsc (path, message) {
  console.log('sending osc message', path, message)
  return new Promise((resolve, reject) => {
    client.send(path, message, err => {
      if (err) reject(err)
      else resolve()
    })
  })
}
