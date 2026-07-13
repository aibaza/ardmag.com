import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { attributionFromMetadata } from "../lib/attribution/purchase-payload"
import { getCanonicalOrderTotal } from "../lib/order-total"

// Ping minimalist pe Discord (#ardmag, webhook "Medusa") la fiecare comanda:
// cine, cat, ce, de unde. Fail-open: DISCORD_ORDER_WEBHOOK_URL unset = no-op,
// orice eroare se logheaza si se inghite - procesarea comenzii nu depinde de asta.

function formatMoney(amount: unknown, currency: string): string {
  const n = Number(amount)
  if (!Number.isFinite(n)) return `? ${currency.toUpperCase()}`
  return `${n.toFixed(2)} ${currency.toUpperCase()}`
}

export function getOrderDiscordTotal(order: {
  total?: unknown
  summary?: { current_order_total?: unknown } | null
}): number {
  return getCanonicalOrderTotal(order)
}

export function buildOrderDiscordMessage(order: any): Record<string, unknown> {
  const addr = order.shipping_address ?? order.billing_address ?? {}
  const name = [addr.first_name, addr.last_name].filter(Boolean).join(" ") || "necunoscut"
  const who = [name, addr.phone, order.email].filter(Boolean).join("\n")

  const items = (order.items ?? [])
    .map((it: any) => {
      const variant =
        it.variant_title && !/^default( title)?$/i.test(it.variant_title) ? it.variant_title : ""
      const title = [it.product_title || it.title, variant].filter(Boolean).join(" - ")
      const quantity = it.quantity ?? it.detail?.quantity ?? 1
      return `${quantity}x ${title || "necunoscut"}`
    })
    .join("\n")

  const place = [addr.city, addr.province].filter(Boolean).join(", ") || "necunoscut"
  const attribution = attributionFromMetadata(order.metadata ?? {})
  const source = attribution?.resolved_source
    ? [attribution.resolved_source, attribution.resolved_medium]
        .filter((v) => v && v !== "none")
        .join(" / ")
    : "direct"
  const from = [place, source, attribution?.resolved_campaign].filter(Boolean).join("\n")

  const isCod = order.payment_collections?.some((pc: any) =>
    pc.payments?.some((p: any) => p.provider_id?.includes("pp_system_default"))
  )
  const payment = isCod ? "ramburs" : "card"

  const mention = process.env.DISCORD_ORDER_MENTION || ""
  const total = getOrderDiscordTotal(order)
  const headline = `Comanda noua **#${order.display_id}** - **${formatMoney(total, order.currency_code)}**`

  return {
    content: [mention, headline].filter(Boolean).join(" "),
    embeds: [
      {
        title: `#${order.display_id} · ${formatMoney(total, order.currency_code)} · ${payment}`,
        description: items || "necunoscut",
        color: 0x2f9e44,
        fields: [
          { name: "Cine", value: who, inline: true },
          { name: "De unde", value: from, inline: true },
        ],
        timestamp: order.created_at ? new Date(order.created_at).toISOString() : undefined,
      },
    ],
  }
}

export default async function orderPlacedDiscord({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data?.id
  if (!orderId) return

  const webhookUrl = process.env.DISCORD_ORDER_WEBHOOK_URL
  if (!webhookUrl) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "total",
        "summary.*",
        "currency_code",
        "created_at",
        "metadata",
        "items.*",
        "items.detail.quantity",
        "shipping_address.*",
        "billing_address.*",
        "payment_collections.payments.provider_id",
      ],
      filters: { id: orderId },
    })
    const order = orders?.[0]
    if (!order) {
      logger.warn(`[order-discord] Order ${orderId} not found via Query`)
      return
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildOrderDiscordMessage(order)),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      logger.warn(
        `[order-discord] Discord webhook returned ${res.status} for order ${order.display_id}`
      )
      return
    }
    logger.info(`[order-discord] Pinged Discord for order ${order.display_id}`)
  } catch (err) {
    logger.warn(`[order-discord] Failed for order ${orderId} (fail-open): ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
  context: { subscriberId: "order-placed-discord" },
}
