import type { GreenApiCredentials } from '../model/types.ts'

export const cloudPasswordMessage = 'Для входа требуется облачный пароль.'

type InstanceAccess =
  | { ok: true }
  | { ok: false; unauthorized: boolean; message: string }

export async function checkInstanceAccess(
  credentials: GreenApiCredentials,
): Promise<InstanceAccess> {
  const baseUrl = credentials.apiUrl.replace(/\/+$/, '')
  const url = `${baseUrl}/waInstance${encodeURIComponent(credentials.idInstance)}/getStateInstance/${encodeURIComponent(credentials.apiTokenInstance)}`

  try {
    const response = await fetch(url)
    if (response.status === 401) {
      return { ok: false, unauthorized: true, message: cloudPasswordMessage }
    }
    if (!response.ok) {
      return { ok: false, unauthorized: false, message: 'Не удалось проверить доступ к инстансу' }
    }
    return { ok: true }
  } catch {
    return { ok: false, unauthorized: false, message: 'Не удалось проверить доступ к инстансу' }
  }
}
