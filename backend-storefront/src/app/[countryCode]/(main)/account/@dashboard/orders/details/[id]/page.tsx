import { retrieveOrder } from "@lib/data/orders"
import { retrieveCustomer } from "@lib/data/customer"
import { OrderSummary } from "@modules/order/components/OrderSummary"
import { HttpTypes } from "@medusajs/types"
import { redirect, notFound } from "next/navigation"
import { Metadata } from "next"

type Props = {
  params: Promise<{ countryCode: string; id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params
  const order = await retrieveOrder(id).catch(() => null)
  if (!order) notFound()
  return {
    title: `Comanda #${order.display_id}`,
    description: `Detalii comanda`,
  }
}

const statusLabels: Record<string, string> = {
  pending: "In asteptare",
  completed: "Finalizata",
  cancelled: "Anulata",
  requires_action: "Actiune necesara",
}

function badgeClass(status: string): string {
  if (status === "completed") return "badge stock-in"
  if (status === "cancelled") return "badge"
  return "badge stock-low"
}

function fmt(amount: number, currency: string): string {
  return `${(amount / 100).toFixed(2).replace(".", ",")} ${currency.toUpperCase()}`
}

type OrderAddress = HttpTypes.StoreOrder["shipping_address"]

function AddressBlock({ address, label }: { address: OrderAddress; label: string }) {
  if (!address) return null
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--f-mono)",
          fontSize: 10,
          fontWeight: 500,
          color: "var(--fg-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        {address.first_name} {address.last_name}
        <br />
        {address.address_1}
        {address.address_2 ? `, ${address.address_2}` : ""}
        <br />
        {address.postal_code} {address.city}
        <br />
        {address.province ? `${address.province}, ` : ""}
        {address.country_code?.toUpperCase()}
        {address.phone && (
          <>
            <br />
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 13 }}>{address.phone}</span>
          </>
        )}
      </div>
    </div>
  )
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const customer = await retrieveCustomer()
  if (!customer) redirect(`/account`)

  const order = await retrieveOrder(id).catch(() => null)
  if (!order) notFound()

  const statusLabel = statusLabels[order.status] ?? order.status
  const currency = order.currency_code ?? "RON"

  return (
    <div>
      {/* Back link */}
      <a
        href={`/account/orders`}
        className="btn ghost sm"
        style={{ marginBottom: 20, display: "inline-flex" }}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
          <path d="M10 3L5 8l5 5" />
        </svg>
        Inapoi la comenzi
      </a>

      {/* Order header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--f-sans)",
              fontWeight: 600,
              fontSize: 20,
              margin: "0 0 4px",
            }}
          >
            Comanda #{order.display_id}
          </h2>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--fg-muted)" }}>
            {new Date(order.created_at).toLocaleDateString("ro-RO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <span className={badgeClass(order.status)}>{statusLabel}</span>
      </div>

      {/* 2-col: items + summary */}
      <div
        className="order-detail-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 300px",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* Left: items + addresses */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Items panel */}
          <div className="panel" style={{ marginBottom: 0 }}>
            <div className="panel-head">
              <h3>Produse comandate</h3>
            </div>
            <div className="panel-body">
              {(order.items ?? []).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      style={{
                        width: 52,
                        height: 52,
                        objectFit: "cover",
                        borderRadius: "var(--r-sm)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>
                      {item.product_title ?? item.title}
                    </div>
                    {item.variant?.title && item.variant.title !== "Default Title" && (
                      <div
                        style={{
                          fontFamily: "var(--f-mono)",
                          fontSize: 11,
                          color: "var(--fg-muted)",
                          marginTop: 3,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {item.variant.title}
                      </div>
                    )}
                    <div
                      style={{
                        fontFamily: "var(--f-mono)",
                        fontSize: 11,
                        color: "var(--fg-muted)",
                        marginTop: 2,
                      }}
                    >
                      Cant: {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--f-mono)", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                    {fmt(item.unit_price * item.quantity, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses panel */}
          {(order.shipping_address || order.billing_address) && (
            <div className="panel" style={{ marginBottom: 0 }}>
              <div className="panel-body padded">
                <div className="form-row-2">
                  <AddressBlock address={order.shipping_address} label="Adresa de livrare" />
                  <AddressBlock address={order.billing_address} label="Adresa de facturare" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: summary */}
        <div style={{ position: "sticky", top: 24 }}>
          <OrderSummary
            subtotal={order.subtotal ?? 0}
            discount_total={order.discount_total}
            shipping_total={order.shipping_total}
            tax_total={order.tax_total}
            total={order.total ?? 0}
            currency_code={order.currency_code}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .order-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
