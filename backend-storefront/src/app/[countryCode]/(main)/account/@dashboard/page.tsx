import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { OrderRow } from "@modules/order/components/OrderRow"
import { HttpTypes } from "@medusajs/types"
import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { countryCode } = await params
  const customer = await retrieveCustomer()

  if (!customer) {
    redirect(`/account`)
  }

  const orders = await listOrders(5, 0).catch(() => [] as HttpTypes.StoreOrder[])

  return (
    <div>
      <h2 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, fontSize: 20, marginBottom: 24 }}>
        Salut, {customer.first_name}!
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <div className="panel">
          <div className="panel-body padded" style={{ textAlign: "center", padding: "24px 20px" }}>
            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, fontFamily: "var(--f-mono)" }}>
              {orders.length}
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 8, fontFamily: "var(--f-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Comenzi totale
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-body padded" style={{ textAlign: "center", padding: "24px 20px" }}>
            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, fontFamily: "var(--f-mono)" }}>
              {customer.addresses?.length ?? 0}
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 8, fontFamily: "var(--f-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Adrese salvate
            </div>
          </div>
        </div>

        <a
          href="/account/profile"
          className="panel"
          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}
        >
          <span style={{ fontSize: 13, fontWeight: 500 }}>Editeaza profilul</span>
        </a>
      </div>

      {orders.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <h3>Comenzi recente</h3>
            <a href="/account/orders" className="btn ghost sm">
              Vezi toate
            </a>
          </div>
          <div className="panel-body">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} countryCode={countryCode} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
