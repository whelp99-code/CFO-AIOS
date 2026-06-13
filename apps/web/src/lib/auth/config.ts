/** Shared JWT auth gate — safe for Edge middleware and Node routes. */
export function getJwtSecret(): string | null {
  const secret = process.env.JWT_SECRET?.trim();
  return secret && secret.length >= 16 ? secret : null;
}

export function isAuthConfigured(): boolean {
  return Boolean(getJwtSecret());
}
