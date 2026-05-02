import { listOrders } from "@lib/data/orders"
import { retrieveCustomer } from "@lib/data/customer"
import { OrderRow } from "@modules/order/components/OrderRow"
import { HttpTypes } from "@medusajs/types"
import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function OrdersPage({ params }: Props) {
  const { countryCode } = await params
  const customer = await retrieveCustomer()

  if (!customer) {
    redirect(`/account`)
  }

  const orders = await listOrders(20, 0).catch(() => [] as HttpTypes.StoreOrder[])

  if (orders.length === 0) {
    return (
      <div className="panel" style={{ padding: "32px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--fg-muted)", marginBottom: 16 }}>Nu ai comenzi inca.</p>
        <a href="/categories" className="btn primary md">
          Incepe cumparaturile
        </a>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Comenzile mele</h3>
        <span className="note">{orders.length} {orders.length === 1 ? "comanda" : "comenzi"}</span>
      </div>
      <div className="panel-body">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} countryCode={countryCode} />
        ))}
      </div>
    </div>
  )
}
