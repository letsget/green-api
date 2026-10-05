import type { GreenApiCredentials } from '@/entities/session'
import { buildInstanceUrl } from './instance-url.ts'

type DeleteResponse = {
  result?: boolean
  message?: string
  reason?: string
}

export async function deleteNotification(
  credentials: GreenApiCredentials,
  receiptId: number,
  signal: AbortSignal,
) {
  const response = await fetch(
    `${buildInstanceUrl(credentials, 'deleteNotification')}/${receiptId}`,
    { method: 'DELETE', signal },
  )
  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(payload?.message || payload?.reason || 'Не удалось подтвердить уведомление')
  }
}

async function readJson(response: Response): Promise<DeleteResponse | null> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as DeleteResponse
  } catch {
    return { message: text }
  }
}
