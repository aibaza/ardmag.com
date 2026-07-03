"use client"
import { useState, useTransition, useEffect } from "react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { FormattedPrice } from "@modules/@shared/components/formatted-price"
import { formatPrice } from "@lib/util/adapters/format-price"
import { HttpTypes } from "@medusajs/types"
import { SHIPPING_PHONE_REQUIRED_MESSAGE } from "@lib/util/checkout-shipping-phone"

const FREE_SHIPPING_THRESHOLD = 500

interface Props {
  cartId: string
  countryCode: string
  shippingOptions: HttpTypes.StoreCartShippingOption[]
  calculatedPrices?: Record<string, number>
  itemTotal?: number
  currentShippingMethodId?: string | null
}

export function CheckoutShipping({ cartId, countryCode, shippingOptions, calculatedPrices = {}, itemTotal = 0, currentShippingMethodId = null }: Props) {
  const [selected, setSelected] = useState<string | null>(currentShippingMethodId ?? shippingOptions[0]?.id ?? null)
  const [isPending, startTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Initializeaza cu preturile pre-calculate de pe server; fallback async pentru cele lipsa
  const [calc, setCalc] = useState<Record<string, number | "loading" | "error">>(() => {
    const init: Record<string, number | "loading"> = {}
    shippingOptions.filter((o) => (o as any).price_type === "calculated").forEach((o) => {
      init[o.id] = calculatedPrices[o.id] ?? "loading"
    })
    return init
  })
  useEffect(() => {
    // Fetch async doar pentru optiunile pentru care nu avem pretul de pe server
    shippingOptions
      .filter((o) => (o as any).price_type === "calculated" && calc[o.id] === "loading")
      .forEach((o) => {
        calculatePriceForShippingOption(o.id, cartId)
          .then((r) => setCalc((c) => ({ ...c, [o.id]: r?.amount ?? "error" })))
          .catch(() => setCalc((c) => ({ ...c, [o.id]: "error" })))
      })
  }, [cartId])

  const freeShippingActive = itemTotal >= FREE_SHIPPING_THRESHOLD

  function getRawAmount(opt: HttpTypes.StoreCartShippingOption): number | null {
    if ((opt as any).price_type === "calculated") {
      const v = calc[opt.id]
      if (typeof v === "number") return v
      return null
    }
    return opt.amount != null ? Number(opt.amount) : null
  }

  function renderPrice(opt: HttpTypes.StoreCartShippingOption): React.ReactNode {
    const raw = getRawAmount(opt)
    if ((opt as any).price_type === "calculated") {
      const v = calc[opt.id]
      if (v === "loading") return "Calculam..."
      if (v === "error" || v == null) return "—"
    }
    if (raw == null) return "—"
    if (raw === 0) {
      return <span style={{ color: "#0f766e", fontWeight: 700 }}>Gratuit</span>
    }
    // Free shipping override pe Fan Courier cand cart depaseste pragul
    const isCalculated = (opt as any).price_type === "calculated"
    if (isCalculated && freeShippingActive) {
      return (
        <span>
          <span style={{ textDecoration: "line-through", color: "var(--fg-muted)", marginRight: 6, fontWeight: 400 }}>
            <FormattedPrice value={formatPrice(raw)} />
          </span>
          <span style={{ color: "#0f766e", fontWeight: 700 }}>Gratuit</span>
        </span>
      )
    }
    return <FormattedPrice value={formatPrice(raw)} />
  }

  async function selectAndPersist(optId: string) {
    const previousSelected = selected
    setSelected(optId)
    setUpdatingId(optId)
    setError(null)
    startTransition(async () => {
      try {
        const result = await setShippingMethod({ cartId, shippingMethodId: optId })
        if (typeof result === "string") {
          setSelected(previousSelected)
          setError(result)
        }
      } finally {
        setUpdatingId(null)
      }
    })
  }

  function handleContinue() {
    if (!selected) return
    setError(null)
    // Asigura ca shipping_method e setat inainte de navigare
    startTransition(async () => {
      const result = await setShippingMethod({ cartId, shippingMethodId: selected })
      if (typeof result === "string") {
        setError(result || SHIPPING_PHONE_REQUIRED_MESSAGE)
      }
    })
  }

  return (
    <div>
      <a href="?step=address" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--fg-muted)', fontSize: 13, fontFamily: 'var(--f-mono)', textDecoration: 'none' }}>← Inapoi la adresa</a>
      <h3 style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, marginBottom: 16 }}>Metoda de livrare</h3>

      {freeShippingActive && (
        <div style={{ background: "#f0fdf4", color: "#0f766e", padding: "10px 14px", borderRadius: "var(--r-md)", fontSize: 13, marginBottom: 12, fontFamily: "var(--f-sans)" }}>
          ✓ Comanda ta depaseste 500 Lei -- livrarea cu Fan Courier este <strong>gratuita</strong>.
        </div>
      )}

      {shippingOptions.length === 0 ? (
        <p style={{ color: 'var(--fg-muted)', marginBottom: 16 }}>Nu sunt disponibile metode de livrare pentru aceasta adresa.</p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {shippingOptions.map((opt) => (
            <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1px solid ${selected === opt.id ? 'var(--brand-600)' : 'var(--rule)'}`, borderRadius: 'var(--r-md)', marginBottom: 8, cursor: 'pointer', fontFamily: 'var(--f-sans)', opacity: updatingId === opt.id ? 0.6 : 1 }}>
              <input
                type="radio"
                name="shipping_option"
                value={opt.id}
                checked={selected === opt.id}
                onChange={() => selectAndPersist(opt.id)}
                disabled={isPending}
              />
              <span style={{ flex: 1 }}>{opt.name}</span>
              <span style={{ fontWeight: 600 }}>{renderPrice(opt)}</span>
            </label>
          ))}
        </div>
      )}

      {error && (
        <p style={{ color: "var(--brand-600)", fontSize: 13, marginBottom: 12, fontFamily: "var(--f-sans)" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        className="btn primary lg"
        style={{ width: '100%' }}
        onClick={handleContinue}
        disabled={!selected || isPending}
      >
        {isPending ? 'Se incarca...' : 'Continua spre plata'}
      </button>
    </div>
  )
}
