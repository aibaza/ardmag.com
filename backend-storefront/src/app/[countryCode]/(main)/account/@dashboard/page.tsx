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
      <h2 style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, fontSize: 20, marginBottom: 24 }}>
        Salut, {customer.first_name}!
      </h2>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <div className="panel">
          <div className="panel-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--f-sans)' }}>{orders.length}</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>Comenzi totale</div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--f-sans)' }}>
              {customer.addresses?.length ?? 0}
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>Adrese salvate</div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body" style={{ textAlign: 'center' }}>
            <a href={`/account/profile`} className="btn ghost sm">
              Editeaza profilul
            </a>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
            Comenzi recente
          </h3>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} countryCode={countryCode} />
          ))}
          <div style={{ marginTop: 16 }}>
            <a href={`/account/orders`} className="btn ghost sm">
              Vezi toate comenzile
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
