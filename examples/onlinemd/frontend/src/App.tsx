import { useState } from 'react'
import { CollabEditor } from './CollabEditor'
import { OnlineUsers } from './OnlineUsers'

const COLORS = ['#e11d48', '#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0891b2']

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function getToken(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('token') || 'test-token'
}

function App() {
  const [docId] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('doc') || 'default-doc'
  })
  const [user] = useState(() => ({
    name: `用户${Math.floor(Math.random() * 1000)}`,
    color: randomColor(),
  }))

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h1 className="text-lg font-semibold">Markdown 协作编辑</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">文档: {docId}</span>
          <OnlineUsers docId={docId} />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <CollabEditor docId={docId} user={user} token={getToken()} />
      </main>
    </div>
  )
}

export default App
