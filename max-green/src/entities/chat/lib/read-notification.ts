import { formatPhone } from './chat-id.ts'
import type { IncomingTextMessage, ReceivedNotification } from '../model/notification.ts'

export function readNotification(payload: unknown): ReceivedNotification | null {
  if (!isRecord(payload) || typeof payload.receiptId !== 'number') return null

  return {
    receiptId: payload.receiptId,
    message: readTextMessage(payload.body, payload.receiptId),
  }
}

function readTextMessage(body: unknown, receiptId: number): IncomingTextMessage | null {
  if (!isRecord(body)) return null
  if (body.typeWebhook !== 'incomingMessageReceived') return null
  if (!isRecord(body.messageData) || body.messageData.typeMessage !== 'textMessage') return null
  if (!isRecord(body.messageData.textMessageData)) return null

  const text = body.messageData.textMessageData.textMessage
  if (typeof text !== 'string' || text.trim() === '') return null

  const sender = isRecord(body.senderData) ? body.senderData : {}
  const phoneNumber = sender.senderPhoneNumber
  const phone =
    typeof phoneNumber === 'number' && phoneNumber > 0
      ? formatPhone(String(phoneNumber))
      : textValue(sender.chatName) || textValue(sender.senderName) || 'Чат'
  const senderChatId = textValue(sender.chatId)
  const phoneDigits = phone.replace(/\D/g, '')

  return {
    id: textValue(body.idMessage) || String(receiptId),
    chatId: senderChatId || (phoneDigits ? `${phoneDigits}@c.us` : String(receiptId)),
    phone,
    text,
  }
}

function textValue(value: unknown) {
  return typeof value === 'string' && value.trim() !== '' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
