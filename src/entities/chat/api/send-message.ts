import type { GreenApiCredentials } from '@/entities/session'

type SendMessageResponse = {
  idMessage?: string
  message?: string
}

export async function sendMessage(
  credentials: GreenApiCredentials,
  chatId: string,
  message: string,
) {
  const baseUrl = credentials.apiUrl.replace(/\/+$/, '')
  const url = `${baseUrl}/waInstance${encodeURIComponent(credentials.idInstance)}/sendMessage/${encodeURIComponent(credentials.apiTokenInstance)}`

  let response: Response

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId,
        message,
        typingTime: '1000',
      }),
    })
  } catch {
    return {
      ok: false as const,
      message: 'Не удалось отправить сообщение',
    }
  }

  if (response.status === 401) {
    return {
      ok: false as const,
      unauthorized: true as const,
      message: 'Требуется облачный пароль для входа',
    }
  }

  const payload = await readJson(response)

  if (!response.ok || !payload?.idMessage) {
    return {
      ok: false as const,
      message: payload?.message || 'Сообщение не отправлено',
    }
  }

  return { ok: true as const }
}

async function readJson(response: Response): Promise<SendMessageResponse | null> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as SendMessageResponse
  } catch {
    return { message: text }
  }
}
