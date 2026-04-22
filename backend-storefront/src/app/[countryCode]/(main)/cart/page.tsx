import { retrieveCart } from "@lib/data/cart"
import { Metadata } from "next"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"
import { Breadcrumb } from "@modules/@shared/components/breadcrumb/Breadcrumb"
import { OrderSummary } from "@modules/order/components/OrderSummary"
import { CartLineItem } from "@modules/cart/components/CartLineItem"

export const metadata: Metadata = { title: "Cos | ardmag.com" }

type Props = { params: Promise<{ countryCode: string }> }

export default async function CartPage({ params }: Props) {
  const { countryCode } = await params
  const cart = await retrieveCart().catch(() => null)
  const items = cart?.items ?? []
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} drawerId="cartDrawer" drawerClosedAttr />
      <main className="page-inner">
        <Breadcrumb
          items={[{ label: "Acasa", href: `/${countryCode}` }]}
          current="Cosul meu"
        />

        <h1
          style={{
            fontFamily: "var(--f-sans)",
            fontWeight: 600,
            fontSize: 24,
            margin: "24px 0 16px",
          }}
        >
          Cosul meu{" "}
          {itemCount > 0 && (
            <span style={{ fontWeight: 400, fontSize: 16, color: "var(--fg-muted)" }}>
              ({itemCount} {itemCount === 1 ? "produs" : "produse"})
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          <div className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
            <p style={{ color: "var(--fg-muted)", marginBottom: 16 }}>
              Cosul tau este gol.
            </p>
            <a href={`/categories`} className="btn primary md">
              Continua cumparaturile
            </a>
          </div>
        ) : (
          <div
            className="cart-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 340px",
              gap: 32,
              alignItems: "flex-start",
            }}
          >
            <div>
              {items.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  currencyCode={cart?.currency_code}
                />
              ))}
            </div>

            <div style={{ position: "sticky", top: 24 }}>
              <OrderSummary
                subtotal={cart?.subtotal ?? 0}
                discount_total={cart?.discount_total}
                shipping_total={cart?.shipping_total}
                tax_total={cart?.tax_total}
                total={cart?.total ?? 0}
                currency_code={cart?.currency_code}
              />
              <div style={{ marginTop: 12 }}>
                <a
                  href={`/checkout`}
                  className="btn primary lg"
                  style={{ width: "100%" }}
                >
                  Continua spre checkout
                </a>
              </div>
            </div>
          </div>
        )}

        <style>{`@media(max-width:768px){.cart-grid{grid-template-columns:1fr!important}}`}</style>
      </main>
      <SiteFooter />
    </>
  )
}
