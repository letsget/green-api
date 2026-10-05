import { Alert, Button, Paper, PasswordInput, Stack, TextInput } from '@mantine/core'
import { useForm, useWatch } from 'react-hook-form'
import type { GreenApiCredentials } from '@/entities/session'
import { requiredField } from '@/shared/utils/required-field'

const defaultApiUrl = 'https://3100.api.green-api.com'

export type CredentialsFormValues = GreenApiCredentials & {
  password: string
}

type EnterCredentialsFormProps = {
  pending: boolean
  message: string | null
  messageTone: 'error' | 'success' | null
  onSubmit: (values: CredentialsFormValues) => void
}

export function EnterCredentialsForm({
  pending,
  message,
  messageTone,
  onSubmit,
}: EnterCredentialsFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsFormValues>({
    defaultValues: {
      apiUrl: defaultApiUrl,
      idInstance: '',
      apiTokenInstance: '',
      password: '',
    },
  })

  const [apiUrl, idInstance, apiTokenInstance] = useWatch({
    control,
    name: ['apiUrl', 'idInstance', 'apiTokenInstance'],
  })
  const canSubmit =
    apiUrl.trim() !== '' && idInstance.trim() !== '' && apiTokenInstance.trim() !== ''

  return (
    <Paper
      component="form"
      withBorder
      radius="md"
      p="lg"
      onSubmit={handleSubmit((values) => {
        if (pending) return

        onSubmit({
          apiUrl: values.apiUrl.trim(),
          idInstance: values.idInstance.trim(),
          apiTokenInstance: values.apiTokenInstance.trim(),
          password: values.password.trim(),
        })
      })}
    >
      <Stack>
        <TextInput
          label="apiUrl"
          autoComplete="off"
          withAsterisk
          error={errors.apiUrl?.message}
          {...register('apiUrl', { validate: requiredField('Укажите apiUrl') })}
        />
        <TextInput
          label="idInstance"
          autoComplete="off"
          withAsterisk
          error={errors.idInstance?.message}
          {...register('idInstance', { validate: requiredField('Укажите idInstance') })}
        />
        <PasswordInput
          label="apiTokenInstance"
          autoComplete="off"
          withAsterisk
          error={errors.apiTokenInstance?.message}
          {...register('apiTokenInstance', {
            validate: requiredField('Укажите apiTokenInstance'),
          })}
        />
        <PasswordInput
          label="Пароль авторизации"
          description="Необязательно"
          autoComplete="off"
          {...register('password')}
        />
        {message ? (
          <Alert color={messageTone === 'success' ? 'green' : 'red'}>{message}</Alert>
        ) : null}
        <Button type="submit" loading={pending} disabled={!canSubmit}>
          Войти
        </Button>
      </Stack>
    </Paper>
  )
}

