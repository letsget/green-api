import type { IncomingTextMessage } from '../model/notification.ts'
import type { Chat } from '../model/types.ts'

export function appendIncomingMessage(chats: Chat[], incoming: IncomingTextMessage): Chat[] {
  const message = {
    id: incoming.id,
    text: incoming.text,
    outgoing: false,
  }
  const index = chats.findIndex((chat) => isSameChat(chat, incoming))

  if (index === -1) {
    return [{ chatId: incoming.chatId, phone: incoming.phone, messages: [message] }, ...chats]
  }

  const chat = chats[index]
  if (!chat || chat.messages.some((item) => item.id === message.id)) return chats

  return chats.map((item, itemIndex) =>
    itemIndex === index ? { ...item, messages: [...item.messages, message] } : item,
  )
}

function isSameChat(chat: Chat, incoming: IncomingTextMessage) {
  if (incoming.chatId && chat.chatId === incoming.chatId) return true

  const incomingDigits = digits(incoming.phone)
  if (incomingDigits.length < 10) return false

  return digits(chat.phone) === incomingDigits || digits(chat.chatId) === incomingDigits
}

function digits(value: string) {
  return value.replace(/\D/g, '')
}
