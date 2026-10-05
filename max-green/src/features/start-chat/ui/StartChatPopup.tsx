import { Alert, Button, Modal, Stack, TextInput } from '@mantine/core'
import { useForm, useWatch } from 'react-hook-form'
import { requiredField } from '@/shared/utils/required-field'

type StartChatPopupProps = {
  open: boolean
  pending: boolean
  error: string | null
  onClose: () => void
  onSubmit: (phone: string) => void
}

export function StartChatPopup({
  open,
  pending,
  error,
  onClose,
  onSubmit,
}: StartChatPopupProps) {
  function handleClose() {
    if (!pending) onClose()
  }

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      title="Новый чат"
      centered
      closeOnClickOutside={!pending}
      closeOnEscape={!pending}
    >
      {open ? <StartChatForm pending={pending} error={error} onSubmit={onSubmit} /> : null}
    </Modal>
  )
}

type StartChatFormProps = {
  pending: boolean
  error: string | null
  onSubmit: (phone: string) => void
}

type StartChatFormValues = {
  phone: string
}

function StartChatForm({ pending, error, onSubmit }: StartChatFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StartChatFormValues>({
    defaultValues: { phone: '' },
  })
  const phone = useWatch({ control, name: 'phone' })

  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (pending) return
        onSubmit(values.phone.trim())
      })}
    >
      <Stack>
        <TextInput
          label="Номер телефона"
          inputMode="tel"
          data-autofocus
          placeholder="79052430145"
          withAsterisk
          error={errors.phone?.message}
          {...register('phone', { validate: requiredField('Введите номер телефона') })}
        />
        {error ? <Alert color="red">{error}</Alert> : null}
        <Button type="submit" loading={pending} disabled={phone.trim() === ''}>
          Начать чат
        </Button>
      </Stack>
    </form>
  )
}
