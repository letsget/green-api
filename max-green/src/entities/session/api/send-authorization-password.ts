import type {
  GreenApiCredentials,
  SendAuthorizationPasswordResult,
} from '../model/types.ts'

const reasonMessages: Record<string, string> = {
  already_registered: 'Инстанс уже авторизован',
  invalid_password: 'Неверный пароль',
  rate_limit_exceeded: 'Слишком много попыток, попробуйте позже',
  authorization_not_started: 'Сначала отсканируйте QR-код в MAX',
  timeout: 'Истекло время ожидания ответа от MAX',
  attempts_exceeded: 'Превышено число попыток ввода пароля',
  time_limit_expired_logout: 'Время на ввод пароля истекло, инстанс разлогинен',
}

type AuthorizationResponse = {
  status?: boolean
  message?: string
  data?: {
    status?: string
    reason?: string
  }
}

export function buildAuthorizationUrl({
  apiUrl,
  idInstance,
  apiTokenInstance,
}: GreenApiCredentials) {
  const baseUrl = apiUrl.replace(/\/+$/, '')

  return `${baseUrl}/waInstance${encodeURIComponent(idInstance)}/sendAuthorizationPassword/${encodeURIComponent(apiTokenInstance)}`
}

export async function sendAuthorizationPassword(
  credentials: GreenApiCredentials,
  password: string,
): Promise<SendAuthorizationPasswordResult> {
  let response: Response

  try {
    response = await fetch(buildAuthorizationUrl(credentials), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })
  } catch {
    return {
      ok: false,
      message: 'Не удалось выполнить запрос авторизации',
    }
  }

  const payload = await readJson(response)

  if (!response.ok) {
    return {
      ok: false,
      message: payload?.message || 'Запрос авторизации отклонён',
    }
  }

  const reason = payload?.data?.reason ?? ''

  if (payload?.status === true && payload.data?.status === 'success') {
    return {
      ok: true,
      message: 'Авторизация выполнена',
    }
  }

  if (reason === 'already_registered') {
    return {
      ok: true,
      message: 'Инстанс уже авторизован',
    }
  }

  return {
    ok: false,
    message: reasonMessages[reason] ?? payload?.message ?? 'Авторизация не выполнена',
  }
}

async function readJson(response: Response): Promise<AuthorizationResponse | null> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as AuthorizationResponse
  } catch {
    return { message: text }
  }
}
