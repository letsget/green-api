export class ApiUnauthorizedError extends Error {
  constructor() {
    super('Требуется облачный пароль для входа')
    this.name = 'ApiUnauthorizedError'
  }
}

export function isUnauthorizedError(error: unknown): error is ApiUnauthorizedError {
  return error instanceof ApiUnauthorizedError
}
