import { getCanonicalOrderTotal } from "../order-total"
import type { OrderWithCanonicalTotal } from "../order-total"

type MetaPurchaseItem = {
  product_id?: unknown
  variant_id?: unknown
  quantity?: number | null
  unit_price?: number | null
}

type MetaPurchaseOrder = OrderWithCanonicalTotal & {
  id: unknown
  currency_code?: string | null
  items?: MetaPurchaseItem[] | null
}

export function buildMetaPurchaseEvent(
  order: MetaPurchaseOrder,
  userData: Record<string, string[] | string>,
  sourceUrl: string,
  eventTime = Math.floor(Date.now() / 1000)
) {
  const contents = (order.items ?? []).map((item) => ({
    id: String(item.product_id ?? item.variant_id ?? ""),
    quantity: item.quantity,
    item_price: item.unit_price,
  }))

  return {
    event_name: "Purchase",
    event_time: eventTime,
    event_id: String(order.id),
    action_source: "website",
    event_source_url: sourceUrl,
    user_data: userData,
    custom_data: {
      currency: (order.currency_code ?? "ron").toUpperCase(),
      value: getCanonicalOrderTotal(order),
      content_type: "product",
      content_ids: contents.map((content) => content.id),
      contents,
      num_items: contents.reduce((sum, content) => sum + (content.quantity ?? 0), 0),
    },
  }
}
