'use babel';

import * as vm from 'vm'
// import { Client } from 'node-osc'
import { CompositeDisposable } from 'atom'
import * as context from './context'

export default {
  subscriptions: null,
  // client: null,

  activate (state) {
    console.log('activating leif')
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'leif:eval': () => this.eval()
    }))

    // client = new Client('127.0.0.1', 3333)
  },

  deactivate () {
    this.subscriptions.dispose()
    // this.client.close()
  },

  serialize () {},

  eval () {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) return

    const range = editor.getCurrentParagraphBufferRange()
    if (!range) return
    const code = editor.getTextInBufferRange(range)

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
