'use babel';

import * as vm from 'vm'
import { Client } from 'node-osc'
import { CompositeDisposable } from 'atom'

export default {
  subscriptions: null,
  client: null,

  activate (state) {
    console.log('activating leif')
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'leif:eval': () => this.eval()
    }))

    client = new Client('127.0.0.1', 3333)

  },

  deactivate () {
    this.subscriptions.dispose()
    this.client.close()
  },

  serialize () {},

  eval () {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) return

    const range = editor.getCurrentParagraphBufferRange()
    if (!range) return
    const code = editor.getTextInBufferRange(range)

    const context = { p: sendPattern }
    vm.createContext(context)

    console.log(`executing:\n${code}`)
    vm.runInContext(code, context)

    const marker = editor.markBufferRange(range, {
      invalidate: 'touch'
    })

    const decoration = editor.decorateMarker(marker, {
      type: 'line',
      class: 'eval-flash'
    })

    setTimeout(() => {
      marker.destroy()
    }, 500)
  }
}

async function sendPattern (channel, pattern) {
  await sendOsc(`/pattern/${channel}/clear`, 'bang')
  if(pattern != 0){                                 //"hush" könnte man sagen
    await sendItems(channel, pattern)
    }
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

async function sendOsc (path, message) {
  console.log('sending osc message', path, message)
  return new Promise((resolve, reject) => {
    client.send(path, message, err => {
      if (err) reject(err)
      else resolve()
    })
  })
}
