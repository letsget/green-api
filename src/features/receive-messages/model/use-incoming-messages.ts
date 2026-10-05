import { useEffect, useRef, useState } from 'react'
import {
  configureIncomingNotifications,
  deleteNotification,
  isUnauthorizedError,
  receiveNotification,
} from '@/entities/chat'
import type { IncomingTextMessage } from '@/entities/chat'
import type { GreenApiCredentials } from '@/entities/session'

export function useIncomingMessages(
  credentials: GreenApiCredentials,
  onMessage: (message: IncomingTextMessage) => void,
) {
  const onMessageRef = useRef(onMessage)
  const [error, setError] = useState<string | null>(null)
  const [passwordRequired, setPasswordRequired] = useState(false)
  const { apiUrl, idInstance, apiTokenInstance } = credentials

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    const currentCredentials = { apiUrl, idInstance, apiTokenInstance }
    const controller = new AbortController()

    async function poll() {
      try {
        await configureIncomingNotifications(currentCredentials, controller.signal)
      } catch (pollError) {
        if (isAbort(pollError)) return
        if (isUnauthorizedError(pollError)) {
          setPasswordRequired(true)
          return
        }
        setError(errorText(pollError, 'Не удалось включить входящие уведомления'))
      }

      while (!controller.signal.aborted) {
        try {
          const notification = await receiveNotification(currentCredentials, controller.signal)
          if (notification?.message) onMessageRef.current(notification.message)
          if (notification) {
            await deleteNotification(currentCredentials, notification.receiptId, controller.signal)
          }
          setError(null)
        } catch (pollError) {
          if (isAbort(pollError)) return
          if (isUnauthorizedError(pollError)) {
            setPasswordRequired(true)
            return
          }
          setError(errorText(pollError, 'Не удалось получить сообщения'))
          try {
            await wait(2000, controller.signal)
          } catch {
            return
          }
        }
      }
    }

    void poll()

    return () => controller.abort()
  }, [apiUrl, idInstance, apiTokenInstance])

  return { error, passwordRequired }
}

function errorText(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, ms)

    function abort() {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    signal.addEventListener('abort', abort, { once: true })
  })
}
