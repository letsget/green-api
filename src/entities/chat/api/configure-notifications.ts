import type { GreenApiCredentials } from '@/entities/session'
import { buildInstanceUrl } from './instance-url.ts'
import { ApiUnauthorizedError } from './unauthorized-error.ts'

type SettingsResponse = {
  message?: string
}

export async function configureIncomingNotifications(
  credentials: GreenApiCredentials,
  signal: AbortSignal,
) {
  const response = await fetch(buildInstanceUrl(credentials, 'setSettings'), {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webhookUrl: '',
      outgoingWebhook: 'yes',
      stateWebhook: 'yes',
      incomingWebhook: 'yes',
    }),
  })

  if (response.status === 401) throw new ApiUnauthorizedError()
  if (response.ok) return

  const payload = await readJson(response)
  throw new Error(payload?.message || 'Не удалось включить входящие уведомления')
}

async function readJson(response: Response): Promise<SettingsResponse | null> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as SettingsResponse
  } catch {
    return { message: text }
  }
}
