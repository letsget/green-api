import type { GreenApiCredentials } from '@/entities/session'
import { readNotification } from '../lib/read-notification.ts'
import type { ReceivedNotification } from '../model/notification.ts'
import { buildInstanceUrl } from './instance-url.ts'
import { ApiUnauthorizedError } from './unauthorized-error.ts'

export async function receiveNotification(
  credentials: GreenApiCredentials,
  signal: AbortSignal,
): Promise<ReceivedNotification | null> {
  const response = await fetch(
    `${buildInstanceUrl(credentials, 'receiveNotification')}?receiveTimeout=5`,
    { signal },
  )
  const payload = await readBody(response)

  if (response.status === 401) throw new ApiUnauthorizedError()

  if (!response.ok) {
    throw new Error(errorMessage(payload) || 'Не удалось получить уведомление')
  }

  if (payload === null) return null
  return readNotification(payload)
}

async function readBody(response: Response) {
  const text = await response.text()
  if (!text || text === 'null') return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return { message: text }
  }
}

function errorMessage(payload: unknown) {
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const message = payload.message
    return typeof message === 'string' ? message : ''
  }

  return ''
}
