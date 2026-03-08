const AUTH_CONFIG_PREFIX = "AUTH_CONFIG:"
const MIN_JWT_SECRET_LENGTH = 32

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error(`${AUTH_CONFIG_PREFIX} JWT_SECRET is required`)
  }

  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `${AUTH_CONFIG_PREFIX} JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters`
    )
  }

  return secret
}

export function getJwtSecretBytes() {
  return new TextEncoder().encode(getJwtSecret())
}

export function isAuthConfigError(error: unknown) {
  return error instanceof Error && error.message.startsWith(AUTH_CONFIG_PREFIX)
}
