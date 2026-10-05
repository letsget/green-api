export function toChatId(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return null

  return `${digits}@c.us`
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits ? `+${digits}` : phone
}
