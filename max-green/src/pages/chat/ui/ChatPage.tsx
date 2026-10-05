import { useEffect, useState } from 'react'
import {
  appendIncomingMessage,
  formatPhone,
  readChatSnapshot,
  saveChatSnapshot,
  sendMessage,
  toChatId,
  type Chat,
} from '@/entities/chat'
import { cloudPasswordMessage, type GreenApiCredentials } from '@/entities/session'
import { useIncomingMessages } from '@/features/receive-messages'
import { StartChatPopup } from '@/features/start-chat'
import { ChatWindow } from '@/widgets/chat-window'

type ChatPageProps = {
  credentials: GreenApiCredentials
  onSignOut: (message: string) => void
}

export function ChatPage({ credentials, onSignOut }: ChatPageProps) {
  const [chats, setChats] = useState<Chat[]>(
    () => readChatSnapshot(credentials.idInstance).chats,
  )
  const [activeChatId, setActiveChatId] = useState<string | null>(
    () => readChatSnapshot(credentials.idInstance).activeChatId,
  )
  const [popupOpen, setPopupOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [popupError, setPopupError] = useState<string | null>(null)
  const [composerError, setComposerError] = useState<string | null>(null)
  const [passwordRequired, setPasswordRequired] = useState(false)

  const activeChat = chats.find((chat) => chat.chatId === activeChatId) ?? null
  const incomingMessages = useIncomingMessages(credentials, (incoming) => {
    setChats((current) => appendIncomingMessage(current, incoming))
  })
  const cloudPasswordRequired = passwordRequired || incomingMessages.passwordRequired

  useEffect(() => {
    if (!cloudPasswordRequired) return
    onSignOut(cloudPasswordMessage)
  }, [cloudPasswordRequired, onSignOut])

  useEffect(() => {
    saveChatSnapshot(credentials.idInstance, { chats, activeChatId })
  }, [activeChatId, chats, credentials.idInstance])

  async function deliver(chatId: string, phone: string, text: string) {
    const result = await sendMessage(credentials, chatId, text)
    if (!result.ok) {
      if ('unauthorized' in result && result.unauthorized) setPasswordRequired(true)
      return result
    }

    const nextMessage = {
      id: crypto.randomUUID(),
      text,
      outgoing: true,
    }

    setChats((current) => {
      const existing = current.find((chat) => chat.chatId === chatId)
      if (!existing) {
        return [{ chatId, phone, messages: [nextMessage] }, ...current]
      }

      return current.map((chat) =>
        chat.chatId === chatId
          ? { ...chat, messages: [...chat.messages, nextMessage] }
          : chat,
      )
    })
    setActiveChatId(chatId)
    return result
  }

  function handleStartChat(phone: string) {
    const chatId = toChatId(phone)
    if (!chatId) {
      setPopupError('Введите номер телефона')
      return
    }

    const formattedPhone = formatPhone(phone)
    setChats((current) => {
      if (current.some((chat) => chat.chatId === chatId)) return current
      return [{ chatId, phone: formattedPhone, messages: [] }, ...current]
    })
    setActiveChatId(chatId)
    setPopupError(null)
    setPopupOpen(false)
  }

  async function handleSend(text: string) {
    if (!activeChat) return false

    setPending(true)
    setComposerError(null)
    const result = await deliver(activeChat.chatId, activeChat.phone, text)
    setPending(false)

    if (!result.ok) {
      setComposerError(result.message)
      return false
    }

    return true
  }

  return (
    <>
      <ChatWindow
        chats={chats}
        activeChat={activeChat}
        pending={pending}
        composerError={composerError}
        inboxError={incomingMessages.error}
        onOpenNewChat={() => {
          setPopupError(null)
          setPopupOpen(true)
        }}
        onSelectChat={setActiveChatId}
        onSend={handleSend}
      />
      <StartChatPopup
        open={popupOpen}
        pending={pending}
        error={popupError}
        onClose={() => setPopupOpen(false)}
        onSubmit={handleStartChat}
      />
    </>
  )
}
