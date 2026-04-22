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

function formatAmount(amount: number, currency: string): string {
  return `${(amount / 100).toFixed(2).replace(".", ",")} ${currency.toUpperCase()}`
}

type OrderAddress = HttpTypes.StoreOrder["shipping_address"]

function AddressBlock({
  address,
  label,
}: {
  address: OrderAddress
  label: string
}) {
  if (!address) return null
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--fg-muted)",
          fontFamily: "var(--f-sans)",
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: "var(--f-sans)", fontSize: 14, lineHeight: 1.6 }}>
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
            {address.phone}
          </>
        )}
      </div>
    </div>
  )
}

export default async function OrderDetailPage({ params }: Props) {
  const { countryCode, id } = await params
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
        style={{
          fontSize: 13,
          color: "var(--fg-muted)",
          fontFamily: "var(--f-sans)",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          marginBottom: 20,
          textDecoration: "none",
        }}
      >
        &larr; Inapoi la comenzi
      </a>

      {/* Order header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
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
              marginBottom: 4,
            }}
          >
            Comanda #{order.display_id}
          </h2>
          <div
            style={{
              fontSize: 13,
              color: "var(--fg-muted)",
              fontFamily: "var(--f-sans)",
            }}
          >
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
        {/* Items */}
        <div>
          <h3
            style={{
              fontFamily: "var(--f-sans)",
              fontWeight: 600,
              fontSize: 15,
              marginBottom: 12,
            }}
          >
            Produse comandate
          </h3>

          {(order.items ?? []).map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{
                    width: 56,
                    height: 56,
                    objectFit: "cover",
                    borderRadius: "var(--r-md)",
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--f-sans)",
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  {item.product_title ?? item.title}
                </div>
                {item.variant?.title && item.variant.title !== "Default Title" && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--fg-muted)",
                      marginTop: 2,
                    }}
                  >
                    {item.variant.title}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--fg-muted)",
                    marginTop: 2,
                  }}
                >
                  Cant: {item.quantity}
                </div>
              </div>
              <div
                style={{ fontFamily: "var(--f-sans)", fontWeight: 500 }}
              >
                {formatAmount(item.unit_price * item.quantity, currency)}
              </div>
            </div>
          ))}

          {/* Addresses */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginTop: 24,
            }}
          >
            <AddressBlock
              address={order.shipping_address}
              label="Adresa de livrare"
            />
            <AddressBlock
              address={order.billing_address}
              label="Adresa de facturare"
            />
          </div>
        </div>

        {/* Summary */}
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
          .order-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
