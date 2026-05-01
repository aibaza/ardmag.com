"use client"
import { useState, useTransition, useEffect } from "react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { HttpTypes } from "@medusajs/types"
import { useRouter } from "next/navigation"

interface Props {
  cartId: string
  countryCode: string
  shippingOptions: HttpTypes.StoreCartShippingOption[]
}

export function CheckoutShipping({ cartId, countryCode, shippingOptions }: Props) {
  const [selected, setSelected] = useState<string | null>(shippingOptions[0]?.id ?? null)
  const [isPending, startTransition] = useTransition()
  const [calc, setCalc] = useState<Record<string, number | "loading" | "error">>({})
  const router = useRouter()

  useEffect(() => {
    shippingOptions
      .filter((o) => (o as any).price_type === "calculated")
      .forEach((o) => {
        setCalc((c) => ({ ...c, [o.id]: "loading" }))
        calculatePriceForShippingOption(o.id, cartId)
          .then((r) => setCalc((c) => ({ ...c, [o.id]: r?.amount ?? "error" })))
          .catch(() => setCalc((c) => ({ ...c, [o.id]: "error" })))
      })
  }, [cartId])

  function displayPrice(opt: HttpTypes.StoreCartShippingOption): string {
    if ((opt as any).price_type === "calculated") {
      const v = calc[opt.id]
      if (v === "loading") return "Calculam..."
      if (v === "error" || v == null) return "—"
      return `${(v / 100).toFixed(2)} RON`
    }
    return opt.amount != null ? `${(opt.amount / 100).toFixed(2)} RON` : "Gratuit"
  }

  function handleContinue() {
    if (!selected) return
    startTransition(async () => {
      await setShippingMethod({ cartId, shippingMethodId: selected })
      router.push(`/checkout?step=payment`)
    })
  }

  return (
    <div>
      <a href="?step=address" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--fg-muted)', fontSize: 13, fontFamily: 'var(--f-mono)', textDecoration: 'none' }}>← Inapoi la adresa</a>
      <h3 style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, marginBottom: 16 }}>Metoda de livrare</h3>

      {shippingOptions.length === 0 ? (
        <p style={{ color: 'var(--fg-muted)', marginBottom: 16 }}>Nu sunt disponibile metode de livrare pentru aceasta adresa.</p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {shippingOptions.map((opt) => (
            <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1px solid ${selected === opt.id ? 'var(--brand-600)' : 'var(--rule)'}`, borderRadius: 'var(--r-md)', marginBottom: 8, cursor: 'pointer', fontFamily: 'var(--f-sans)' }}>
              <input type="radio" name="shipping_option" value={opt.id} checked={selected === opt.id} onChange={() => setSelected(opt.id)} />
              <span style={{ flex: 1 }}>{opt.name}</span>
              <span style={{ fontWeight: 600 }}>{displayPrice(opt)}</span>
            </label>
          ))}
        </div>
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
