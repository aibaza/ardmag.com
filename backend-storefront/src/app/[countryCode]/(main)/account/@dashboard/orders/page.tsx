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

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, fontSize: 20, marginBottom: 24 }}>
        Comenzile mele
      </h2>

      {orders.length === 0 ? (
        <div className="panel" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--fg-muted)', marginBottom: 16 }}>Nu ai comenzi inca.</p>
          <a href={`/categories`} className="btn primary md">
            Incepe cumparaturile
          </a>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} countryCode={countryCode} />
          ))}
        </div>
      )}
    </div>
  )
}
