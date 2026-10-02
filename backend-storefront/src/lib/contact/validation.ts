export type ContactMessage = {
  name: string
  email: string
  phone: string
  message: string
}

export function validateContact(value: unknown): ContactMessage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const body = value as Record<string, unknown>
  const fields = ["name", "email", "phone", "message"] as const
  const limits = { name: 120, email: 254, phone: 40, message: 5000 }
  const result = {} as ContactMessage
  for (const field of fields) {
    const raw = body[field] ?? (field === "phone" ? "" : null)
    if (
      typeof raw !== "string" ||
      raw.length > limits[field] ||
      /[\r\n]/.test(field === "message" ? "" : raw)
    )
      return null
    result[field] = raw.trim()
  }
  if (
    !result.name ||
    !result.message ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)
  )
    return null
  return result
}

export async function readContactBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader()
  if (!reader) throw new Error("Missing body")
  let size = 0
  let text = ""
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 16384) {
        await reader.cancel()
        throw new Error("Body too large")
      }
      text += decoder.decode(value, { stream: true })
    }
    return JSON.parse(text + decoder.decode())
  } finally {
    reader.releaseLock()
  }
}
