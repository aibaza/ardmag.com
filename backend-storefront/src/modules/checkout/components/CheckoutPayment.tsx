"use client"
import { useState, useTransition } from "react"
import { initiatePaymentSession } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

interface Props {
  cart: HttpTypes.StoreCart
  countryCode: string
  paymentProviders: HttpTypes.StorePaymentProvider[]
}

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY)
  : null

function isStripe(id: string) {
  return id.includes("stripe") && !id.includes("oxxo") && !id.includes("ideal")
    && !id.includes("giropay") && !id.includes("blik") && !id.includes("bancontact")
    && !id.includes("przelewy") && !id.includes("promptpay")
}

const labelStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12,
  padding: "12px 16px",
  border: "1px solid var(--rule)", borderRadius: "var(--r-md)",
  marginBottom: 8, cursor: "pointer", fontFamily: "var(--f-sans)",
}

function providerLabel(id: string) {
  if (id.includes("pp_system_default")) return "Ramburs la livrare"
  if (isStripe(id)) return "Card bancar (Stripe)"
  return id
}

// ─── Inner form — are acces la stripe/elements context ────────────────────────

function StripeCardForm({
  cart,
  clientSecret,
  onSuccess,
}: {
  cart: HttpTypes.StoreCart
  clientSecret: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleConfirm() {
    if (!stripe || !elements) return
    const card = elements.getElement(CardElement)
    if (!card) return

    setError(null)
    startTransition(async () => {
      const addr = cart.billing_address
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card,
            billing_details: {
              name: [addr?.first_name, addr?.last_name].filter(Boolean).join(" ") || undefined,
              email: cart.email || undefined,
              phone: addr?.phone || undefined,
              address: {
                line1: addr?.address_1 || undefined,
                city: addr?.city || undefined,
                postal_code: addr?.postal_code || undefined,
                country: addr?.country_code || undefined,
                state: addr?.province || undefined,
              },
            },
          },
        }
      )

      if (stripeError) {
        // Dacă paymentIntent e requires_capture, plata a reusit (capturat de Medusa)
        if (
          stripeError.payment_intent?.status === "requires_capture" ||
          stripeError.payment_intent?.status === "succeeded"
        ) {
          onSuccess()
          return
        }
        setError(stripeError.message ?? "Eroare la procesarea platii.")
        return
      }

      if (
        paymentIntent?.status === "requires_capture" ||
        paymentIntent?.status === "succeeded"
      ) {
        onSuccess()
      }
    })
  }

  return (
    <div style={{ marginTop: 12, padding: "12px 16px", border: "1px solid var(--brand-400)", borderRadius: "var(--r-md)", background: "var(--stone-50)" }}>
      <div style={{ marginBottom: 10, fontFamily: "var(--f-sans)", fontSize: 13, fontWeight: 500, color: "var(--fg-muted)" }}>
        Date card
      </div>
      <div style={{ padding: "10px 12px", border: "1px solid var(--rule)", borderRadius: "var(--r-md)", background: "white" }}>
        <CardElement options={{
          style: {
            base: {
              fontSize: "14px",
              fontFamily: "var(--f-sans), system-ui, sans-serif",
              color: "var(--fg-base, #1a1a1a)",
              "::placeholder": { color: "var(--fg-subtle, #9ca3af)" },
            },
            invalid: { color: "var(--brand-600, #dc2626)" },
          },
          hidePostalCode: true,
        }} />
      </div>
      {error && (
        <p style={{ color: "var(--brand-600)", fontSize: 13, marginTop: 8, fontFamily: "var(--f-sans)" }}>
          {error}
        </p>
      )}
      <button
        type="button"
        className="btn primary lg"
        style={{ width: "100%", marginTop: 12 }}
        onClick={handleConfirm}
        disabled={isPending || !stripe}
      >
        {isPending ? "Se procesează..." : "Confirmă plata cu cardul"}
      </button>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function CheckoutPayment({ cart, paymentProviders }: Props) {
  const [selected, setSelected] = useState<string>(paymentProviders[0]?.id ?? "")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const selectedIsStripe = isStripe(selected)

  async function handleSelect(id: string) {
    setSelected(id)
    setClientSecret(null)
    setError(null)
  }

  async function handleContinue() {
    if (!selected) return
    setError(null)

    startTransition(async () => {
      try {
        const resp = await initiatePaymentSession(cart, { provider_id: selected }) as any

        if (selectedIsStripe) {
          // SDK returneaza { payment_collection: { payment_sessions: [...] } }
          const sessions = resp?.payment_collection?.payment_sessions ?? []
          const secret = sessions.find((s: any) => s.provider_id === selected)?.data?.client_secret

          if (secret) {
            setClientSecret(secret)
          } else {
            setError("Nu s-a putut initia sesiunea de plata Stripe. Incearca din nou.")
          }
        } else {
          router.push("/checkout?step=review")
        }
      } catch (e: any) {
        setError(e.message ?? "A aparut o eroare.")
      }
    })
  }

  // Dupa confirmare Stripe cu succes
  function handleStripeSuccess() {
    router.push("/checkout?step=review")
  }

  return (
    <div>
      <a
        href="?step=delivery"
        style={{ display: "inline-block", marginBottom: 16, color: "var(--fg-muted)", fontSize: 13, fontFamily: "var(--f-mono)", textDecoration: "none" }}
      >
        ← Inapoi la livrare
      </a>
      <h3 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, marginBottom: 16 }}>
        Metoda de plata
      </h3>

      {paymentProviders.length === 0 ? (
        <p style={{ color: "var(--fg-muted)", marginBottom: 16 }}>
          Nu sunt disponibile metode de plata.
        </p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {paymentProviders.map((prov) => (
            <label
              key={prov.id}
              style={{
                ...labelStyle,
                borderColor: selected === prov.id ? "var(--brand-600)" : "var(--rule)",
              }}
            >
              <input
                type="radio"
                name="payment_provider"
                value={prov.id}
                checked={selected === prov.id}
                onChange={() => handleSelect(prov.id)}
              />
              <span>{providerLabel(prov.id)}</span>
            </label>
          ))}
        </div>
      )}

      {error && (
        <p style={{ color: "var(--brand-600)", fontSize: 13, marginBottom: 12, fontFamily: "var(--f-sans)" }}>
          {error}
        </p>
      )}

      {/* Card form — apare dupa ce clientSecret e obtinut */}
      {selectedIsStripe && clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <StripeCardForm
            cart={cart}
            clientSecret={clientSecret}
            onSuccess={handleStripeSuccess}
          />
        </Elements>
      )}

      {/* Buton principal — ascuns cand cardul e afisat */}
      {!clientSecret && (
        <button
          type="button"
          className="btn primary lg"
          style={{ width: "100%" }}
          onClick={handleContinue}
          disabled={!selected || isPending}
        >
          {isPending
            ? "Se incarca..."
            : selectedIsStripe
              ? "Continua cu cardul"
              : "Revizuieste comanda"}
        </button>
      )}
    </div>
  )
}
