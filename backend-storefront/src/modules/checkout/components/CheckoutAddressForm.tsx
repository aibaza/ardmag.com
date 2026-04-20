"use client"
import { useActionState, useState } from "react"
import { setAddresses } from "@lib/data/cart"

interface Props {
  countryCode: string
  customerEmail?: string
}

export function CheckoutAddressForm({ countryCode, customerEmail }: Props) {
  const [error, action] = useActionState(setAddresses, null)
  const [sameAsBilling, setSameAsBilling] = useState(true)

  const field = (label: string, name: string, type = 'text', required = true) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--fg-muted)', fontFamily: 'var(--f-sans)' }}>{label}{required && ' *'}</label>
      <input type={type} name={name} required={required} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', fontFamily: 'var(--f-sans)', fontSize: 14, boxSizing: 'border-box' }} />
    </div>
  )

  return (
    <form action={action}>
      <input type="hidden" name="shipping_address.country_code" value={countryCode === 'ro' ? 'ro' : countryCode} />

      <h3 style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, marginBottom: 16 }}>Adresa de livrare</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>{field('Prenume', 'shipping_address.first_name')}</div>
        <div>{field('Nume', 'shipping_address.last_name')}</div>
      </div>
      {field('Email', 'email', 'email')}
      {field('Telefon', 'shipping_address.phone', 'tel')}
      {field('Adresa', 'shipping_address.address_1')}
      {field('Oras', 'shipping_address.city')}
      {field('Cod postal', 'shipping_address.postal_code')}
      {field('Judet', 'shipping_address.province')}

      <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          id="same_as_billing"
          name="same_as_billing"
          checked={sameAsBilling}
          onChange={(e) => setSameAsBilling(e.target.checked)}
          style={{ width: 16, height: 16, cursor: 'pointer' }}
        />
        <label htmlFor="same_as_billing" style={{ fontFamily: 'var(--f-sans)', fontSize: 14, cursor: 'pointer', color: 'var(--fg-base)' }}>
          Adresa de facturare este aceeasi cu cea de livrare
        </label>
      </div>

      {!sameAsBilling && (
        <div>
          <input type="hidden" name="billing_address.country_code" value={countryCode === 'ro' ? 'ro' : countryCode} />
          <h3 style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, marginBottom: 16, marginTop: 8 }}>Adresa de facturare</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>{field('Prenume', 'billing_address.first_name')}</div>
            <div>{field('Nume', 'billing_address.last_name')}</div>
          </div>
          {field('Telefon', 'billing_address.phone', 'tel')}
          {field('Adresa', 'billing_address.address_1')}
          {field('Oras', 'billing_address.city')}
          {field('Cod postal', 'billing_address.postal_code')}
          {field('Judet', 'billing_address.province')}
        </div>
      )}

      {error && <p style={{ color: 'var(--brand-600)', fontSize: 13, marginBottom: 12 }}>{error as string}</p>}

      <button type="submit" className="btn primary lg" style={{ width: '100%', marginTop: 8 }}>
        Continua spre livrare
      </button>
    </form>
  )
}
