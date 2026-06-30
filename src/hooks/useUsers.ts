import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { UserRole } from '../types/report'

export interface UserEntry {
  email: string
  role: UserRole
  centro?: string
}

export function useUsers() {
  const [users, setUsers]   = useState<UserEntry[]>([])
  const [loading, setLoading] = useState(true)

  async function loadUsers() {
    setLoading(true)
    const snap = await getDoc(doc(db, 'config', 'roles'))
    const data = snap.data() ?? {}
    const admins: string[]                = data.admins  ?? []
    const gestors: Record<string, string> = data.gestors ?? {}

    const list: UserEntry[] = [
      ...admins.map(e => ({ email: e.toLowerCase(), role: 'admin' as UserRole })),
      ...Object.entries(gestors).map(([e, c]) => ({
        email: e.toLowerCase(),
        role:  'gestor' as UserRole,
        centro: c as string,
      })),
    ]
    setUsers(list)
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function persist(newUsers: UserEntry[]) {
    const admins  = newUsers.filter(u => u.role === 'admin').map(u => u.email)
    const gestors = Object.fromEntries(
      newUsers.filter(u => u.role === 'gestor' && u.centro).map(u => [u.email, u.centro!])
    )
    await setDoc(doc(db, 'config', 'roles'), { admins, gestors })
    setUsers(newUsers)
  }

  async function addUser(email: string, role: UserRole, centro?: string) {
    const filtered = users.filter(u => u.email !== email)
    const entry: UserEntry = { email, role, ...(centro ? { centro } : {}) }
    await persist([...filtered, entry])
  }

  async function updateUser(email: string, role: UserRole, centro?: string) {
    const filtered = users.filter(u => u.email !== email)
    const entry: UserEntry = { email, role, ...(centro ? { centro } : {}) }
    await persist([...filtered, entry])
  }

  async function removeUser(email: string) {
    await persist(users.filter(u => u.email !== email))
  }

  return { users, loading, addUser, updateUser, removeUser, reload: loadUsers }
}
