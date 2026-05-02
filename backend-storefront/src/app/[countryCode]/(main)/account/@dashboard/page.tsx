import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { OrderRow } from "@modules/order/components/OrderRow"
import { HttpTypes } from "@medusajs/types"
import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string }>
}

function formatMonthYear(date?: string | Date): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("ro-RO", { month: "long", year: "numeric" })
}

function formatRelativeDate(date: string | Date): string {
  const diffMs = Date.now() - new Date(date).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 1) return "azi"
  if (diffDays < 2) return "ieri"
  if (diffDays < 14) return `acum ${diffDays} ${diffDays === 1 ? "zi" : "zile"}`
  return new Date(date).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" })
}

export default async function DashboardPage({ params }: Props) {
  const { countryCode } = await params
  const customer = await retrieveCustomer()
  if (!customer) redirect(`/account`)

  const orders = await listOrders(8, 0).catch(() => [] as HttpTypes.StoreOrder[])
  const lastOrder = orders[0]
  const memberSince = formatMonthYear(customer.created_at)

  return (
    <div>
      {/* Greeting */}
      <h2 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, fontSize: 20, marginBottom: 6 }}>
        Salut, {customer.first_name}!
      </h2>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 0, marginBottom: 24 }}>
        {customer.email}
        {memberSince && <> · cont creat in {memberSince}</>}
      </p>

      {/* Stats */}
      <div className="dash-grid-3" style={{ marginBottom: 16 }}>
        {/* Comenzi */}
        <div className="panel" style={{ marginBottom: 0, textAlign: "center", padding: "24px 20px" }}>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, fontFamily: "var(--f-mono)" }}>
            {orders.length}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 8, fontFamily: "var(--f-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Ultimele comenzi
          </div>
        </div>

        {/* Adrese */}
        <div className="panel" style={{ marginBottom: 0, textAlign: "center", padding: "24px 20px" }}>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, fontFamily: "var(--f-mono)" }}>
            {customer.addresses?.length ?? 0}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 8, fontFamily: "var(--f-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Adrese salvate
          </div>
        </div>

        {/* Ultima comanda */}
        <div className="panel" style={{ marginBottom: 0, textAlign: "center", padding: "24px 20px" }}>
          {lastOrder ? (
            <>
              <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, fontFamily: "var(--f-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {formatRelativeDate(lastOrder.created_at ?? "")}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 8, fontFamily: "var(--f-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Ultima comanda · #{lastOrder.display_id}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.4 }}>
              Nicio comanda
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dash-grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: "Continua cumparaturile", href: `/${countryCode}/categories` },
          { label: "Adresele mele", href: `/account/addresses` },
          { label: "Profilul meu", href: `/account/profile` },
        ].map(({ label, href }) => (
          <a key={href} href={href} className="dash-quick-action">
            {label}
            <span style={{ fontFamily: "var(--f-mono)", color: "var(--fg-muted)", fontSize: 14 }}>→</span>
          </a>
        ))}
      </div>

      {/* Comenzi recente */}
      {orders.length > 0 ? (
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
      ) : (
        <div className="panel">
          <div className="panel-body padded" style={{ textAlign: "center", padding: "32px 24px" }}>
            <p style={{ color: "var(--fg-muted)", marginBottom: 16 }}>Nu ai comenzi inca.</p>
            <a href={`/${countryCode}/categories`} className="btn primary md">
              Cumpara acum
            </a>
          </div>
        </div>
      )}
      <style>{`
        .dash-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        @media(max-width:560px){ .dash-grid-3 { grid-template-columns:1fr; } }
        .dash-quick-action {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 18px;
          background: var(--surface);
          border: 1px solid var(--rule);
          border-radius: var(--r-sm);
          text-decoration: none;
          color: var(--fg);
          font-size: 14px;
          font-weight: 500;
          transition: background 80ms;
          white-space: nowrap;
          overflow: hidden;
        }
        .dash-quick-action span { margin-left: auto; flex-shrink: 0; }
        .dash-quick-action:hover {
          background: var(--stone-50);
          color: var(--brand-700);
        }
      `}</style>
    </div>
  )
}
