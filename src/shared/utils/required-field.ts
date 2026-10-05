export function requiredField(message: string) {
  return (value: string) => value.trim() !== '' || message
}
