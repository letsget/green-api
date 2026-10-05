import { Center, Stack, Title } from '@mantine/core'
import { useState } from 'react'
import {
  checkInstanceAccess,
  sendAuthorizationPassword,
  type GreenApiCredentials,
} from '@/entities/session'
import {
  EnterCredentialsForm,
  type CredentialsFormValues,
} from '@/features/enter-credentials'

type AuthPageProps = {
  initialMessage?: string | null
  onAuthorized: (credentials: GreenApiCredentials) => void
}

export function AuthPage({ initialMessage = null, onAuthorized }: AuthPageProps) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(initialMessage)
  const [messageTone, setMessageTone] = useState<'error' | 'success' | null>(
    initialMessage ? 'error' : null,
  )

  async function handleSubmit({ password, ...credentials }: CredentialsFormValues) {
    setPending(true)
    setMessage(null)
    setMessageTone(null)

    if (password) {
      const result = await sendAuthorizationPassword(credentials, password)

      if (!result.ok) {
        setPending(false)
        setMessage(result.message)
        setMessageTone('error')
        return
      }
    }

    const access = await checkInstanceAccess(credentials)
    if (!access.ok) {
      setPending(false)
      setMessage(access.message)
      setMessageTone('error')
      return
    }

    onAuthorized(credentials)
  }

  return (
    <Center mih="100vh" bg="gray.0" p="md">
      <Stack w="100%" maw={420} gap="lg">
        <Title order={1} ta="center">
          Вход в MAX
        </Title>
        <EnterCredentialsForm
          pending={pending}
          message={message}
          messageTone={messageTone}
          onSubmit={handleSubmit}
        />
      </Stack>
    </Center>
  )
}
