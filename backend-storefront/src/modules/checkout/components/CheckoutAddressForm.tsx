"use client"
import { useActionState, useState } from "react"
import { setAddresses } from "@lib/data/cart"
import { JUDETE_RO } from "@lib/data/romania"

interface Props {
  countryCode: string
  customerEmail?: string
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px",
  border: "1px solid var(--rule)", borderRadius: "var(--r-md)",
  fontFamily: "var(--f-sans)", fontSize: 14, boxSizing: "border-box",
  background: "var(--bg-base)",
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 500,
  marginBottom: 4, color: "var(--fg-muted)", fontFamily: "var(--f-sans)",
}

function Field({ label, name, type = "text", required = true }: {
  label: string; name: string; type?: string; required?: boolean
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}{required && " *"}</label>
      <input type={type} name={name} required={required} style={inputStyle} />
    </div>
  )
}

function PostalField({ name }: { name: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>Cod poștal *</label>
      <input
        type="text"
        name={name}
        required
        maxLength={6}
        pattern="\d{6}"
        title="6 cifre"
        placeholder="400001"
        style={inputStyle}
      />
    </div>
  )
}

function ProvinceSelect({ name }: { name: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>Județ *</label>
      <select name={name} required defaultValue="" style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
        <option value="" disabled>Selectează județul</option>
        {JUDETE_RO.map((j) => (
          <option key={j} value={j}>{j}</option>
        ))}
      </select>
    </div>
  )
}

function AddressFields({ prefix }: { prefix: "shipping_address" | "billing_address" }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Prenume" name={`${prefix}.first_name`} />
        <Field label="Nume" name={`${prefix}.last_name`} />
      </div>
      <Field label="Telefon" name={`${prefix}.phone`} type="tel" />
      <Field label="Adresă" name={`${prefix}.address_1`} />
      <Field label="Oraș" name={`${prefix}.city`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <PostalField name={`${prefix}.postal_code`} />
        <ProvinceSelect name={`${prefix}.province`} />
      </div>
    </>
  )
}

export function CheckoutAddressForm({ countryCode }: Props) {
  const [error, action] = useActionState(setAddresses, null)
  const [sameAsBilling, setSameAsBilling] = useState(true)

  return (
    <form action={action}>
      <input type="hidden" name="shipping_address.country_code" value="ro" />

      <h3 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, marginBottom: 16 }}>
        Adresa de livrare
      </h3>

      <Field label="Email" name="email" type="email" />
      <AddressFields prefix="shipping_address" />

      <div style={{ margin: "16px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          id="same_as_billing"
          name="same_as_billing"
          checked={sameAsBilling}
          onChange={(e) => setSameAsBilling(e.target.checked)}
          style={{ width: 16, height: 16, cursor: "pointer" }}
        />
        <label htmlFor="same_as_billing" style={{ fontFamily: "var(--f-sans)", fontSize: 14, cursor: "pointer", color: "var(--fg-base)" }}>
          Adresa de facturare este aceeași cu cea de livrare
        </label>
      </div>

      {!sameAsBilling && (
        <>
          <input type="hidden" name="billing_address.country_code" value="ro" />
          <h3 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, marginBottom: 16, marginTop: 8 }}>
            Adresa de facturare
          </h3>
          <AddressFields prefix="billing_address" />
        </>
      )}

      {error && (
        <p style={{ color: "var(--brand-600)", fontSize: 13, marginBottom: 12 }}>
          {error as string}
        </p>
      )}

      <button type="submit" className="btn primary lg" style={{ width: "100%", marginTop: 8 }}>
        Continuă spre livrare
      </button>
    </form>
  )
}
