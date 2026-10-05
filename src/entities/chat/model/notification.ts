export type IncomingTextMessage = {
  id: string
  chatId: string
  phone: string
  text: string
}

export type ReceivedNotification = {
  receiptId: number
  message: IncomingTextMessage | null
}
