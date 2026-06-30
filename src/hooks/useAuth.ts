import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { useConfig } from '../context/ConfigContext'
import type { UserRole } from '../types/report'

const provider = new GoogleAuthProvider()

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const config                = useConfig()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  async function signInWithGoogle() {
    await signInWithPopup(auth, provider)
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  function getRoleFromEmail(email: string): UserRole {
    const lower = email.toLowerCase()
    if (config.admins.has(lower)) return 'admin'
    if (config.gestors[lower])    return 'gestor'
    return 'operario'
  }

  const role: UserRole              = user ? getRoleFromEmail(user.email!) : 'operario'
  const gestorCenter: string | null = user ? (config.gestors[user.email!.toLowerCase()] ?? null) : null

  return { user, loading, role, gestorCenter, signInWithGoogle, signOut }
}
