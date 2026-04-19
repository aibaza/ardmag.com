"use client"
import { useState, useTransition } from "react"
import { setShippingMethod } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useRouter } from "next/navigation"

interface Props {
  cartId: string
  countryCode: string
  shippingOptions: HttpTypes.StoreShippingOption[]
}

export function CheckoutShipping({ cartId, countryCode, shippingOptions }: Props) {
  const [selected, setSelected] = useState<string | null>(shippingOptions[0]?.id ?? null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleContinue() {
    if (!selected) return
    startTransition(async () => {
      await setShippingMethod({ cartId, shippingMethodId: selected })
      router.push(`/${countryCode}/checkout?step=payment`)
    })
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, marginBottom: 16 }}>Metoda de livrare</h3>

      {shippingOptions.length === 0 ? (
        <p style={{ color: 'var(--fg-muted)', marginBottom: 16 }}>Nu sunt disponibile metode de livrare pentru aceasta adresa.</p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {shippingOptions.map((opt) => (
            <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1px solid ${selected === opt.id ? 'var(--brand-600)' : 'var(--rule)'}`, borderRadius: 'var(--r-md)', marginBottom: 8, cursor: 'pointer', fontFamily: 'var(--f-sans)' }}>
              <input type="radio" name="shipping_option" value={opt.id} checked={selected === opt.id} onChange={() => setSelected(opt.id)} />
              <span style={{ flex: 1 }}>{opt.name}</span>
              <span style={{ fontWeight: 600 }}>
                {opt.amount != null ? `${(opt.amount / 100).toFixed(2)} RON` : 'Gratuit'}
              </span>
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
