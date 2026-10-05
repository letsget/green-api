import type { GreenApiCredentials } from '@/entities/session'

export function buildInstanceUrl(credentials: GreenApiCredentials, method: string) {
  const baseUrl = credentials.apiUrl.replace(/\/+$/, '')

  return `${baseUrl}/waInstance${encodeURIComponent(credentials.idInstance)}/${method}/${encodeURIComponent(credentials.apiTokenInstance)}`
}
