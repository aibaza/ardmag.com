"use client"
import { useActionState } from "react"
import { setAddresses } from "@lib/data/cart"

interface Props {
  countryCode: string
  customerEmail?: string
}

export function CheckoutAddressForm({ countryCode, customerEmail }: Props) {
  const [error, action] = useActionState(setAddresses, null)

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

      {error && <p style={{ color: 'red', fontSize: 13, marginBottom: 12 }}>{error as string}</p>}

      <button type="submit" className="btn primary" style={{ width: '100%', marginTop: 8 }}>
        Continua spre livrare
      </button>
    </form>
  )
}
