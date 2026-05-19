import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Audit one-shot: listeaza comenzile din ultimele 14 zile cu total real
// (raw decimal post migrare 18 mai 2026), email client, payment status si CC.
// Foloseste pentru a identifica comenzile care au primit emailuri cu preturi /100.
//
// Rulare: npx medusa exec ./src/scripts/list-recent-orders.ts
export default async function listRecentOrders({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const since = new Date()
  since.setDate(since.getDate() - 14)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "total",
      "currency_code",
      "created_at",
      "items.product_title",
      "items.variant_title",
      "items.quantity",
      "items.unit_price",
      "payment_collections.status",
    ],
    filters: { created_at: { $gte: since } as never },
  })

  if (!orders || orders.length === 0) {
    logger.info("Nicio comanda in ultimele 14 zile.")
    return
  }

  logger.info(`Comenzi din ultimele 14 zile (${orders.length} total):`)
  logger.info("─".repeat(100))

  const sorted = [...orders].sort((a: any, b: any) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  for (const order of sorted as any[]) {
    const date = new Date(order.created_at).toISOString().replace("T", " ").slice(0, 16)
    const total = Number(order.total ?? 0).toFixed(2)
    const paymentStatus = order.payment_collections?.[0]?.status ?? "n/a"
    logger.info(
      `#${order.display_id} | ${date} | ${order.email} | ${total} ${order.currency_code?.toUpperCase() ?? "RON"} | payment: ${paymentStatus}`
    )
    for (const item of order.items ?? []) {
      const variant = item.variant_title && item.variant_title !== "Default Title"
        ? ` (${item.variant_title})`
        : ""
      logger.info(`    ${item.quantity}x ${item.product_title}${variant} @ ${Number(item.unit_price).toFixed(2)}`)
    }
  }

  logger.info("─".repeat(100))
  logger.info("NOTA: totalele de mai sus sunt valorile reale (raw decimal) din DB.")
  logger.info("Emailurile trimise inainte de fix au afisat aceste valori impartite la 100.")
}
