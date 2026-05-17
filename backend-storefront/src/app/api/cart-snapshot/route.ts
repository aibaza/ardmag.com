import { NextResponse } from "next/server"
import { retrieveCart } from "@lib/data/cart"

export async function GET() {
  const cart = await retrieveCart().catch(() => null)

  if (!cart) {
    return NextResponse.json(
      { itemCount: 0, totalAmount: 0, currencyCode: "RON", lastItem: null },
      { headers: { "Cache-Control": "no-store" } }
    )
  }

  const items = cart.items ?? []
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const sortedByActivity = [...items].sort((a: any, b: any) => {
    const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime()
    const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime()
    return bTime - aTime
  })

  const last: any = sortedByActivity[0] ?? null

  const lastItem = last
    ? {
        title: last.product_title ?? last.title ?? "",
        variantTitle:
          last.variant_title && last.variant_title !== "Default"
            ? last.variant_title
            : null,
        thumbnail: last.thumbnail ?? null,
        quantity: last.quantity ?? 0,
        subtotal: (last.subtotal ?? last.unit_price * last.quantity ?? 0) / 1,
      }
    : null

  return NextResponse.json(
    {
      itemCount,
      totalAmount: (cart.subtotal ?? cart.total ?? 0) / 1,
      currencyCode: (cart.currency_code ?? "ron").toUpperCase(),
      lastItem,
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
