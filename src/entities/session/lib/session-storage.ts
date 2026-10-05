import type { GreenApiCredentials } from '../model/types.ts'

const sessionKey = 'max-green.session'

export function readSession(): GreenApiCredentials | null {
  const payload = readJson(sessionKey)
  if (!isCredentials(payload)) return null

  return payload
}

export function saveSession(credentials: GreenApiCredentials) {
  writeJson(sessionKey, credentials)
}

export function clearSession() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(sessionKey)
}

function isCredentials(value: unknown): value is GreenApiCredentials {
  if (!isRecord(value)) return false

  return (
    typeof value.apiUrl === 'string' &&
    value.apiUrl !== '' &&
    typeof value.idInstance === 'string' &&
    value.idInstance !== '' &&
    typeof value.apiTokenInstance === 'string' &&
    value.apiTokenInstance !== ''
  )
}

function readJson(key: string) {
  if (typeof localStorage === 'undefined') return null

  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as unknown) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
