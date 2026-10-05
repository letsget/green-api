import { Center, Loader } from '@mantine/core'
import { useCallback, useEffect, useState } from 'react'
import {
  checkInstanceAccess,
  clearSession,
  cloudPasswordMessage,
  readSession,
  saveSession,
  type GreenApiCredentials,
} from '@/entities/session'
import { AuthPage } from '@/pages/auth'
import { ChatPage } from '@/pages/chat'

export function App() {
  const [credentials, setCredentials] = useState<GreenApiCredentials | null>(null)
  const [ready, setReady] = useState(() => readSession() === null)
  const [authMessage, setAuthMessage] = useState<string | null>(null)

  useEffect(() => {
    const saved = readSession()
    if (!saved) return

    const session = saved
    let cancelled = false

    async function restore() {
      const access = await checkInstanceAccess(session)
      if (cancelled) return

      if (!access.ok) {
        clearSession()
        setAuthMessage(access.unauthorized ? cloudPasswordMessage : access.message)
        setReady(true)
        return
      }

      setCredentials(session)
      setReady(true)
    }

    void restore()

    return () => {
      cancelled = true
    }
  }, [])

  const signOut = useCallback((message: string) => {
    clearSession()
    setAuthMessage(message)
    setCredentials(null)
  }, [])

  function handleAuthorized(nextCredentials: GreenApiCredentials) {
    saveSession(nextCredentials)
    setAuthMessage(null)
    setCredentials(nextCredentials)
  }

  if (!ready) {
    return (
      <Center mih="100vh">
        <Loader />
      </Center>
    )
  }

  if (!credentials) {
    return <AuthPage initialMessage={authMessage} onAuthorized={handleAuthorized} />
  }

  return <ChatPage credentials={credentials} onSignOut={signOut} />
}
