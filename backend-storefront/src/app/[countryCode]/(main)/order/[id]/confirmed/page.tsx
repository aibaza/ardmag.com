import { retrieveOrder } from "@lib/data/orders"
import { Metadata } from "next"
import { SiteHeaderShell } from "@modules/layout/site-header/SiteHeaderShell"
import { SiteFooter } from "@modules/layout/site-footer"
import { Breadcrumb } from "@modules/@shared/components/breadcrumb/Breadcrumb"
import { OrderSummary } from "@modules/order/components/OrderSummary"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Comanda confirmata | ardmag.com",
}

type Props = {
  params: Promise<{ countryCode: string; id: string }>
}

export default async function OrderConfirmedPage({ params }: Props) {
  const { countryCode, id } = await params
  const order = await retrieveOrder(id).catch(() => null)

  if (!order) notFound()

  const currency = order.currency_code?.toUpperCase() ?? "RON"

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} drawerId="confDrawer" drawerClosedAttr />
      <main className="page-inner">
        <Breadcrumb
          items={[{ label: "Acasa", href: `/${countryCode}` }]}
          current="Comanda confirmata"
        />

        {/* Success banner */}
        <div
          style={{
            background: "var(--success-bg)",
            border: "1px solid var(--success)",
            borderRadius: "var(--r-md)",
            padding: "24px",
            marginBottom: 32,
            marginTop: 24,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}
          >
            <span style={{ fontSize: 24 }}>&#10003;</span>
            <h1
              style={{
                fontFamily: "var(--f-sans)",
                fontWeight: 700,
                fontSize: 22,
                color: "var(--success-fg)",
                margin: 0,
              }}
            >
              Multumim! Comanda ta a fost plasata.
            </h1>
          </div>
          <p
            style={{
              fontFamily: "var(--f-sans)",
              fontSize: 14,
              color: "var(--success-fg)",
              margin: 0,
            }}
          >
            Comanda #{order.display_id} a fost inregistrata. Vei primi un email de
            confirmare la {order.email}.
          </p>
        </div>

        {/* 2-col: items + summary */}
        <div
          className="confirmed-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 320px",
            gap: 32,
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--f-sans)",
                fontWeight: 600,
                fontSize: 18,
                marginBottom: 16,
              }}
            >
              Produse comandate
            </h2>
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
                    style={{ fontFamily: "var(--f-sans)", fontWeight: 500, fontSize: 14 }}
                  >
                    {item.product_title ?? item.title}
                  </div>
                  {item.variant?.title && item.variant.title !== "Default Title" && (
                    <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                      {item.variant.title}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                    Cant: {item.quantity}
                  </div>
                </div>
                <div style={{ fontFamily: "var(--f-sans)", fontWeight: 500 }}>
                  {((item.unit_price * item.quantity) / 100).toFixed(2)} {currency}
                </div>
              </div>
            ))}

            {/* Address */}
            {order.shipping_address && (
              <div style={{ marginTop: 24 }}>
                <h3
                  style={{
                    fontFamily: "var(--f-sans)",
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 8,
                  }}
                >
                  Adresa de livrare
                </h3>
                <div
                  style={{
                    fontFamily: "var(--f-sans)",
                    fontSize: 14,
                    color: "var(--fg-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                  <br />
                  {order.shipping_address.address_1}
                  <br />
                  {order.shipping_address.postal_code} {order.shipping_address.city}
                  <br />
                  {order.shipping_address.country_code?.toUpperCase()}
                </div>
              </div>
            )}
          </div>

          <div style={{ position: "sticky", top: 24 }}>
            <OrderSummary
              subtotal={order.subtotal ?? 0}
              discount_total={order.discount_total}
              shipping_total={order.shipping_total}
              tax_total={order.tax_total}
              total={order.total ?? 0}
              currency_code={order.currency_code}
            />
            <div
              style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}
            >
              <a
                href={`/account/orders`}
                className="btn secondary md"
                style={{ justifyContent: "center" }}
              >
                Comenzile mele
              </a>
              <a
                href={`/${countryCode}/produse`}
                className="btn ghost md"
                style={{ justifyContent: "center" }}
              >
                Inapoi la magazin
              </a>
            </div>
          </div>
        </div>

        <style>{`@media(max-width:768px){.confirmed-grid{grid-template-columns:1fr!important}}`}</style>
      </main>
      <SiteFooter />
    </>
  )
}
