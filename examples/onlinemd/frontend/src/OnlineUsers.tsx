import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

interface Props {
  docId: string
}

interface UserInfo {
  name: string
  color: string
}

export function OnlineUsers({ docId }: Props) {
  const [users, setUsers] = useState<UserInfo[]>([])

  useEffect(() => {
    const ydoc = new Y.Doc()
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${window.location.host}/ws?doc=${docId}`
    const provider = new WebsocketProvider(wsUrl, docId, ydoc, { connect: true })

    const updateUsers = () => {
      const states = provider.awareness.getStates()
      const userList: UserInfo[] = []
      states.forEach((state: any) => {
        if (state.user) {
          userList.push(state.user)
        }
      })
      setUsers(userList)
    }

    provider.awareness.on('change', updateUsers)
    updateUsers()

    return () => {
      provider.awareness.off('change', updateUsers)
      provider.destroy()
      ydoc.destroy()
    }
  }, [docId])

  if (users.length === 0) return null

  return (
    <div className="flex -space-x-2">
      {users.map((u, i) => (
        <div
          key={i}
          title={u.name}
          className="w-7 h-7 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs font-medium"
          style={{ backgroundColor: u.color }}
        >
          {u.name.charAt(0).toUpperCase()}
        </div>
      ))}
      <span className="ml-3 text-sm text-gray-400 self-center">
        {users.length} 人在线
      </span>
    </div>
  )
}
