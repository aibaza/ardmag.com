import { loginFanCourier } from "./api"

let cached: { token: string; expiresAt: number } | null = null

export async function getToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token
  const result = await loginFanCourier()
  cached = { token: result.token, expiresAt: new Date(result.expiresAt).getTime() }
  return cached.token
}
