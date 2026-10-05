import type { Chat, ChatMessage } from '../model/types.ts'

type ChatSnapshot = {
  chats: Chat[]
  activeChatId: string | null
}

const emptySnapshot: ChatSnapshot = {
  chats: [],
  activeChatId: null,
}

export function readChatSnapshot(idInstance: string): ChatSnapshot {
  const payload = readJson(storageKey(idInstance))
  if (!isRecord(payload) || !Array.isArray(payload.chats)) return emptySnapshot

  const chats = payload.chats.filter(isChat)
  const activeChatId = typeof payload.activeChatId === 'string' ? payload.activeChatId : null

  return {
    chats,
    activeChatId: chats.some((chat) => chat.chatId === activeChatId) ? activeChatId : null,
  }
}

export function saveChatSnapshot(idInstance: string, snapshot: ChatSnapshot) {
  writeJson(storageKey(idInstance), snapshot)
}

function storageKey(idInstance: string) {
  return `max-green.messages.${idInstance}`
}

function isChat(value: unknown): value is Chat {
  if (!isRecord(value)) return false
  if (typeof value.chatId !== 'string' || typeof value.phone !== 'string') return false
  if (!Array.isArray(value.messages) || !value.messages.every(isMessage)) return false

  return true
}

function isMessage(value: unknown): value is ChatMessage {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    typeof value.text === 'string' &&
    typeof value.outgoing === 'boolean'
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
