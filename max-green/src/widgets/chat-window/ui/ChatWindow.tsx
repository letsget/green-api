import {
  ActionIcon,
  Alert,
  Avatar,
  Center,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { Chat } from '@/entities/chat'
import { requiredField } from '@/shared/utils/required-field'

type ChatWindowProps = {
  chats: Chat[]
  activeChat: Chat | null
  pending: boolean
  composerError: string | null
  inboxError: string | null
  onOpenNewChat: () => void
  onSelectChat: (chatId: string | null) => void
  onSend: (text: string) => Promise<boolean>
}

export function ChatWindow({
  chats,
  activeChat,
  pending,
  composerError,
  inboxError,
  onOpenNewChat,
  onSelectChat,
  onSend,
}: ChatWindowProps) {
  const [query, setQuery] = useState('')
  const { control, register, handleSubmit, reset } = useForm<{ message: string }>({
    defaultValues: { message: '' },
  })
  const draft = useWatch({ control, name: 'message' })

  const visibleChats = chats.filter((chat) =>
    chat.phone.replace(/\D/g, '').includes(query.replace(/\D/g, '')),
  )
  const hasMessages = Boolean(activeChat && activeChat.messages.length > 0)

  async function handleSend({ message }: { message: string }) {
    const text = message.trim()
    if (!text || !activeChat || pending) return
    const sent = await onSend(text)
    if (sent) reset()
  }

  return (
    <Flex h="100dvh" direction={{ base: 'column', sm: 'row' }} bg="white">
      <Stack
        gap={0}
        w={{ base: '100%', sm: 360 }}
        h={{ base: '42vh', sm: '100%' }}
        bd="1px solid gray.2"
      >
        <Group justify="space-between" px="md" pt="md" pb="xs">
          <Title order={2}>Чаты</Title>
          <ActionIcon
            size="lg"
            radius="xl"
            aria-label="Новый чат"
            onClick={onOpenNewChat}
          >
            +
          </ActionIcon>
        </Group>
        <TextInput
          mx="md"
          mb="sm"
          placeholder="Найти"
          value={query}
          leftSection={<Text c="dimmed">⌕</Text>}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ScrollArea flex={1}>
          <Stack gap={0}>
            {visibleChats.map((chat) => {
              const lastMessage = chat.messages.at(-1)
              const active = chat.chatId === activeChat?.chatId

              return (
                <UnstyledButton
                  key={chat.chatId}
                  w="100%"
                  px="md"
                  py="xs"
                  bg={active ? 'gray.1' : undefined}
                  onClick={() => onSelectChat(chat.chatId)}
                >
                  <Group wrap="nowrap" gap="sm">
                    <Avatar radius="xl" color="blue">
                      {chat.phone.slice(-2)}
                    </Avatar>
                    <Stack gap={0} flex={1} miw={0}>
                      <Text truncate>{chat.phone}</Text>
                      <Text size="sm" c="dimmed" truncate>
                        {lastMessage?.text}
                      </Text>
                    </Stack>
                  </Group>
                </UnstyledButton>
              )
            })}
          </Stack>
        </ScrollArea>
      </Stack>

      <Flex direction="column" flex={1} miw={0} mih={0} bg="blue.1">
        <Group bg="white" px="md" py="sm" wrap="nowrap" gap="sm">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="lg"
            aria-label="К списку чатов"
            onClick={() => onSelectChat(null)}
          >
            ‹
          </ActionIcon>
          <Avatar color="green" radius="xl">
            G
          </Avatar>
          <Stack gap={0}>
            <Text fw={700}>{activeChat?.phone ?? 'GREEN-API MAX'}</Text>
            <Text size="xs" c="dimmed">
              Был(-а) недавно
            </Text>
          </Stack>
        </Group>
        {inboxError ? (
          <Alert color="red" radius={0} variant="light">
            {inboxError}
          </Alert>
        ) : null}

        {hasMessages ? (
          <ScrollArea flex={1} offsetScrollbars>
            <Stack gap="xs" p="md" mih="100%" justify="flex-end">
              {activeChat?.messages.map((message) => (
                <Paper
                  key={message.id}
                  maw="70%"
                  px="sm"
                  py={8}
                  radius="lg"
                  shadow="xs"
                  bg={message.outgoing ? 'white' : 'blue.0'}
                  ms={message.outgoing ? 'auto' : undefined}
                >
                  <Text size="sm">{message.text}</Text>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        ) : (
          <Center flex={1} p="md">
            <Paper radius="md" p="xl" maw={280} ta="center" bg="white">
              <Text fw={700}>Сообщений пока нет</Text>
              <Text size="sm" c="dimmed" mt="xs">
                Напишите сообщение или начните новый чат
              </Text>
            </Paper>
          </Center>
        )}

        <Paper
          component="form"
          radius="xl"
          p="xs"
          m="md"
          shadow="sm"
          onSubmit={handleSubmit(handleSend)}
        >
          <Group gap="xs" wrap="nowrap" align="center">
            <TextInput
              flex={1}
              variant="unstyled"
              placeholder="Сообщение"
              disabled={!activeChat || pending}
              {...register('message', { validate: requiredField('Введите сообщение') })}
            />
            <ActionIcon
              type="submit"
              radius="xl"
              size="lg"
              disabled={!activeChat || pending || draft.trim() === ''}
            >
              ↑
            </ActionIcon>
          </Group>
          {composerError ? (
            <Text c="red" size="sm" px="sm" pb={4}>
              {composerError}
            </Text>
          ) : null}
        </Paper>
      </Flex>
    </Flex>
  )
}
