import { useEffect, useRef } from 'react'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands'
import { basicSetup } from 'codemirror'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { yCollab } from 'y-codemirror.next'
import { IndexeddbPersistence } from 'y-indexeddb'

interface Props {
  docId: string
  user: { name: string; color: string }
  token: string
}

export function CollabEditor({ docId, user, token }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ydoc = new Y.Doc()
    const ytext = ydoc.getText('content')
    const undoManager = new Y.UndoManager(ytext)

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = import.meta.env.DEV
      ? `${wsProtocol}//${window.location.host}`
      : `${wsProtocol}//${window.location.host}`
    const wsUrl = `${wsHost}/ws?doc=${docId}&token=${token}`

    const provider = new WebsocketProvider(wsUrl, docId, ydoc, {
      connect: true,
    })

    new IndexeddbPersistence(docId, ydoc)

    provider.awareness.setLocalStateField('user', user)

    const state = EditorState.create({
      extensions: [
        basicSetup,
        markdown(),
        oneDark,
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        yCollab(ytext, provider.awareness, { undoManager }),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
        }),
      ],
    })

    const view = new EditorView({ state, parent: ref.current })

    return () => {
      view.destroy()
      provider.destroy()
      ydoc.destroy()
    }
  }, [docId, user, token])

  return <div ref={ref} className="h-full w-full" />
}
