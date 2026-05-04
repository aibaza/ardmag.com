import { NextRequest, NextResponse } from "next/server"

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export async function POST(req: NextRequest) {
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { email } = body
  if (!email) {
    return NextResponse.json({ error: "Email necesar" }, { status: 400 })
  }

  const res = await fetch(`${MEDUSA_BACKEND_URL}/store/newsletter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ email }),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
