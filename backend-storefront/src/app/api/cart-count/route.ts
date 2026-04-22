import { NextResponse } from "next/server"
import { retrieveCart } from "@lib/data/cart"

export async function GET() {
  const cart = await retrieveCart().catch(() => null)
  const count = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  return NextResponse.json({ count }, {
    headers: { "Cache-Control": "no-store" },
  })
}
