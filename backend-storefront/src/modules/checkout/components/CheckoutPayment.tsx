"use client"
import { useState, useTransition } from "react"
import { initiatePaymentSession } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useRouter } from "next/navigation"

interface Props {
  cart: HttpTypes.StoreCart
  countryCode: string
  paymentProviders: HttpTypes.StorePaymentProvider[]
}

export function CheckoutPayment({ cart, countryCode, paymentProviders }: Props) {
  const [selected, setSelected] = useState<string | null>(paymentProviders[0]?.id ?? null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleContinue() {
    if (!selected || !cart.id) return
    startTransition(async () => {
      await initiatePaymentSession(cart, { provider_id: selected })
      router.push(`/${countryCode}/checkout?step=review`)
    })
  }

  const providerLabel = (id: string) => {
    if (id.includes('pp_system_default')) return 'Ramburs la livrare'
    if (id.includes('stripe')) return 'Card bancar (Stripe)'
    if (id.includes('manual')) return 'Plata manuala'
    return id
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, marginBottom: 16 }}>Metoda de plata</h3>

      {paymentProviders.length === 0 ? (
        <p style={{ color: 'var(--fg-muted)', marginBottom: 16 }}>Nu sunt disponibile metode de plata.</p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {paymentProviders.map((prov) => (
            <label key={prov.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1px solid ${selected === prov.id ? 'var(--brand-600)' : 'var(--rule)'}`, borderRadius: 'var(--r-md)', marginBottom: 8, cursor: 'pointer', fontFamily: 'var(--f-sans)' }}>
              <input type="radio" name="payment_provider" value={prov.id} checked={selected === prov.id} onChange={() => setSelected(prov.id)} />
              <span>{providerLabel(prov.id)}</span>
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
        {isPending ? 'Se incarca...' : 'Revizuieste comanda'}
      </button>
    </div>
  )
}
