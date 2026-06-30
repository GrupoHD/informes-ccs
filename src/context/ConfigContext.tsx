import { createContext, useContext, useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'

export interface AppConfig {
  admins:      Set<string>
  gestors:     Record<string, string>   // email → centro
  mailRouting: Record<string, string>   // centro → email destinatario
}

const defaultConfig: AppConfig = {
  admins:      new Set(),
  gestors:     {},
  mailRouting: {},
}

const ConfigContext = createContext<AppConfig>(defaultConfig)

export function useConfig(): AppConfig {
  return useContext(ConfigContext)
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setConfig(defaultConfig)
        return
      }

      const [rolesSnap, mailSnap] = await Promise.all([
        getDoc(doc(db, 'config', 'roles')),
        getDoc(doc(db, 'config', 'mailRouting')),
      ])

      const rolesData = rolesSnap.data() ?? {}
      const mailData  = mailSnap.data()  ?? {}

      setConfig({
        admins:      new Set<string>((rolesData.admins ?? []).map((e: string) => e.toLowerCase())),
        gestors:     Object.fromEntries(
          Object.entries(rolesData.gestors ?? {}).map(([k, v]) => [k.toLowerCase(), v])
        ) as Record<string, string>,
        mailRouting: mailData as Record<string, string>,
      })
    })

    return unsub
  }, [])

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}
