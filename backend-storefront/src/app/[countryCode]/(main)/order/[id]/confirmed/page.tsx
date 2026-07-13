import { retrieveOrder } from "@lib/data/orders"
import { Metadata } from "next"
import { SiteHeaderShell } from "@modules/layout/site-header/SiteHeaderShell"
import { SiteFooter } from "@modules/layout/site-footer"
import { Breadcrumb } from "@modules/@shared/components/breadcrumb/Breadcrumb"
import { OrderSummary } from "@modules/order/components/OrderSummary"
import { FormattedPrice } from "@modules/@shared/components/formatted-price"
import { formatPrice } from "@lib/util/adapters/format-price"
import { PurchaseTracker } from "@modules/analytics/PurchaseTracker"
import { notFound } from "next/navigation"
import { getCanonicalOrderTotal } from "@lib/order/purchase-total"

export const metadata: Metadata = {
  title: "Comanda confirmata | ARDmag.ro",
}

function formatRoDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  const datePart = d.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const timePart = d.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  })
  return `${datePart}, ora ${timePart}`
}

type Props = {
  params: Promise<{ countryCode: string; id: string }>
}

export default async function OrderConfirmedPage({ params }: Props) {
  const { countryCode, id } = await params
  const order = await retrieveOrder(id).catch(() => null)

  if (!order) notFound()

  const currency = order.currency_code?.toUpperCase() ?? "RON"
  const purchaseValue = getCanonicalOrderTotal(order)

  const purchaseContents = (order.items ?? []).map((item) => ({
    id: String(item.product_id ?? (item as any).variant_id ?? item.id),
    quantity: item.quantity,
    price: item.unit_price,
    name: item.product_title ?? item.title,
  }))

  return (
    <>
      <PurchaseTracker
        orderId={String(order.id)}
        value={purchaseValue}
        currency={currency}
        contents={purchaseContents}
      />
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
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
            Comanda #{order.display_id} a fost inregistrata. Vei primi un email de confirmare la{" "}
            {order.email}.
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
                            fontFamily: "var(--f-mono)",
                            fontSize: 11,
                            color: "var(--fg-muted)",
                            marginTop: 2,
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
                    <div
                      style={{
                        fontFamily: "var(--f-mono)",
                        fontWeight: 600,
                        fontSize: 13,
                        flexShrink: 0,
                        textAlign: "right",
                      }}
                    >
                      <FormattedPrice
                        value={formatPrice(item.unit_price * item.quantity, currency)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery details panel */}
            {(order.shipping_address || (order.shipping_methods?.length ?? 0) > 0) && (
              <div className="panel" style={{ marginBottom: 0 }}>
                <div className="panel-head">
                  <h3>Detalii livrare</h3>
                  <span className="note">Plasată pe {formatRoDateTime(order.created_at)}</span>
                </div>
                <div className="panel-body padded">
                  <div className="form-row-2">
                    {order.shipping_address && (
                      <div>
                        <div className="eyebrow" style={{ marginBottom: 8 }}>
                          Adresă
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                          {order.shipping_address.first_name} {order.shipping_address.last_name}
                          <br />
                          {order.shipping_address.address_1}
                          {order.shipping_address.address_2
                            ? `, ${order.shipping_address.address_2}`
                            : ""}
                          <br />
                          {order.shipping_address.postal_code} {order.shipping_address.city}
                          <br />
                          {order.shipping_address.province
                            ? `${order.shipping_address.province}, `
                            : ""}
                          {order.shipping_address.country_code?.toUpperCase()}
                          {order.shipping_address.phone && (
                            <>
                              <br />
                              <span
                                style={{
                                  fontFamily: "var(--f-mono)",
                                  fontSize: 13,
                                }}
                              >
                                {order.shipping_address.phone}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {(order.shipping_methods?.length ?? 0) > 0 && (
                      <div>
                        <div className="eyebrow" style={{ marginBottom: 8 }}>
                          Metodă livrare
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                          {order.shipping_methods!.map((sm) => (
                            <div key={sm.id} style={{ marginBottom: 4 }}>
                              {sm.name}
                              <div
                                style={{
                                  fontFamily: "var(--f-mono)",
                                  fontSize: 12,
                                  color: "var(--fg-muted)",
                                  marginTop: 2,
                                }}
                              >
                                <FormattedPrice value={formatPrice(sm.amount ?? 0, currency)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ position: "sticky", top: 24 }}>
            <OrderSummary
              subtotal={
                (order as any).item_total ?? (order.subtotal ?? 0) - (order.shipping_total ?? 0)
              }
              discount_total={order.discount_total}
              shipping_total={order.shipping_total}
              tax_total={order.tax_total}
              total={order.total ?? 0}
              currency_code={order.currency_code}
            />
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
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
