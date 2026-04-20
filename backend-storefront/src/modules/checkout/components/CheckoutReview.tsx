import { retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { PlaceOrderButton } from "./PlaceOrderButton"

interface Props {
  cartId: string
}

function fmt(amount: number | null | undefined, currency: string): string {
  if (amount == null) return "--"
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

function providerLabel(id: string): string {
  if (id.includes("pp_system_default")) return "Ramburs la livrare"
  if (id.includes("stripe")) return "Card bancar (Stripe)"
  if (id.includes("manual")) return "Plata manuala"
  return id
}

function AddressBlock({ addr }: { addr: HttpTypes.StoreCartAddress }) {
  const name = [addr.first_name, addr.last_name].filter(Boolean).join(" ")
  const line2 = [addr.city, addr.postal_code, addr.country_code?.toUpperCase()]
    .filter(Boolean)
    .join(", ")
  return (
    <div style={{ fontFamily: "var(--f-sans)", fontSize: 14, lineHeight: 1.6 }}>
      {name && <div style={{ fontWeight: 500 }}>{name}</div>}
      {addr.address_1 && <div>{addr.address_1}</div>}
      {line2 && <div style={{ color: "var(--fg-muted)" }}>{line2}</div>}
      {addr.phone && (
        <div style={{ color: "var(--fg-muted)" }}>{addr.phone}</div>
      )}
    </div>
  )
}

export async function CheckoutReview({ cartId }: Props) {
  const cart = await retrieveCart(cartId)

  if (!cart) {
    return (
      <div style={{ fontFamily: "var(--f-sans)", color: "var(--fg-muted)" }}>
        Nu s-a putut incarca comanda. Reincarca pagina.
      </div>
    )
  }

  const currency = cart.currency_code ?? "RON"
  const shippingMethod = cart.shipping_methods?.[0]
  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  return (
    <div>
      <a
        href="?step=payment"
        style={{
          display: "inline-block",
          marginBottom: 16,
          color: "var(--fg-muted)",
          fontSize: 13,
          fontFamily: "var(--f-mono)",
          textDecoration: "none",
        }}
      >
        &larr; Inapoi la plata
      </a>

      <h3
        style={{
          fontFamily: "var(--f-sans)",
          fontWeight: 600,
          marginBottom: 24,
        }}
      >
        Confirma comanda
      </h3>

      {/* Line items */}
      <section style={{ marginBottom: 24 }}>
        <h4
          style={{
            fontFamily: "var(--f-sans)",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--fg-muted)",
            marginBottom: 12,
          }}
        >
          Produse
        </h4>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {cart.items?.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.product_title ?? ""}
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: "cover",
                    borderRadius: "var(--r-md)",
                    flexShrink: 0,
                    background: "var(--stone-100)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--r-md)",
                    background: "var(--stone-100)",
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
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.product_title}
                  {item.variant?.title &&
                    item.variant.title !== "Default Title" && (
                      <span style={{ fontWeight: 400 }}>
                        {" - "}
                        {item.variant.title}
                      </span>
                    )}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--fg-muted)",
                    marginTop: 2,
                  }}
                >
                  x{item.quantity}
                </div>
              </div>

              <div
                style={{
                  fontFamily: "var(--f-sans)",
                  fontWeight: 600,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {fmt(item.unit_price * item.quantity, currency)}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Totals */}
      <section style={{ marginBottom: 24 }}>
        <h4
          style={{
            fontFamily: "var(--f-sans)",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--fg-muted)",
            marginBottom: 12,
          }}
        >
          Total
        </h4>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "var(--f-sans)",
            fontSize: 14,
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: "4px 0", color: "var(--fg-muted)" }}>
                Subtotal
              </td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>
                {fmt(cart.subtotal, currency)}
              </td>
            </tr>
            {(cart.discount_total ?? 0) > 0 && (
              <tr>
                <td style={{ padding: "4px 0", color: "var(--fg-muted)" }}>
                  Reducere
                </td>
                <td
                  style={{
                    padding: "4px 0",
                    textAlign: "right",
                    color: "var(--brand-600)",
                  }}
                >
                  -{fmt(cart.discount_total, currency)}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ padding: "4px 0", color: "var(--fg-muted)" }}>
                Transport
              </td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>
                {cart.shipping_total != null && cart.shipping_total > 0
                  ? fmt(cart.shipping_total, currency)
                  : "Gratuit"}
              </td>
            </tr>
            {(cart.tax_total ?? 0) > 0 && (
              <tr>
                <td style={{ padding: "4px 0", color: "var(--fg-muted)" }}>
                  TVA
                </td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {fmt(cart.tax_total, currency)}
                </td>
              </tr>
            )}
            <tr style={{ borderTop: "1px solid var(--rule)" }}>
              <td
                style={{
                  padding: "10px 0 4px",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Total
              </td>
              <td
                style={{
                  padding: "10px 0 4px",
                  textAlign: "right",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {fmt(cart.total, currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Address + shipping + payment summary */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {cart.shipping_address && (
          <div
            style={{
              padding: "12px 16px",
              border: "1px solid var(--rule)",
              borderRadius: "var(--r-md)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--f-sans)",
                fontWeight: 600,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--fg-muted)",
                marginBottom: 8,
              }}
            >
              Adresa de livrare
            </div>
            <AddressBlock addr={cart.shipping_address} />
          </div>
        )}

        <div
          style={{
            padding: "12px 16px",
            border: "1px solid var(--rule)",
            borderRadius: "var(--r-md)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--f-sans)",
              fontWeight: 600,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--fg-muted)",
              marginBottom: 8,
            }}
          >
            Livrare &amp; Plata
          </div>
          <div
            style={{
              fontFamily: "var(--f-sans)",
              fontSize: 14,
              lineHeight: 1.8,
            }}
          >
            <div>
              <span style={{ color: "var(--fg-muted)" }}>Metoda livrare: </span>
              {shippingMethod?.name ?? "--"}
            </div>
            <div>
              <span style={{ color: "var(--fg-muted)" }}>Plata: </span>
              {paymentSession
                ? providerLabel(paymentSession.provider_id)
                : "--"}
            </div>
          </div>
        </div>
      </section>

      <PlaceOrderButton cartId={cartId} />
    </div>
  )
}
