export type ChatMessage = {
  id: string
  text: string
  outgoing: boolean
}

export type Chat = {
  chatId: string
  phone: string
  messages: ChatMessage[]
}
