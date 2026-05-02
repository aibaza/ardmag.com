"use client"
import { useState, useActionState } from "react"
import { addCustomerAddress } from "@lib/data/customer"
import { AddressFields, Field, ProvinceSelect, PostalField, inputStyle, labelStyle } from "@modules/checkout/components/AddressFieldsShared"
import { JUDETE_RO } from "@lib/data/romania"

interface Props {
  countryCode: string
}

export function AddAddressForm({ countryCode }: Props) {
  const [open, setOpen] = useState(false)

  const [state, action] = useActionState(
    async (
      prev: { success: boolean; error: string | null },
      formData: FormData
    ) => {
      const result = await addCustomerAddress({}, formData)
      if (result?.success) setOpen(false)
      return result ?? { success: false, error: "Eroare necunoscuta" }
    },
    { success: false, error: null }
  )

  if (!open) {
    return (
      <button
        type="button"
        className="btn secondary md"
        onClick={() => setOpen(true)}
        style={{ marginBottom: 16 }}
      >
        + Adauga adresa noua
      </button>
    )
  }

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="panel-head">
        <h4 style={{ fontFamily: "var(--f-sans)", fontWeight: 600 }}>Adresa noua</h4>
      </div>
      <div className="panel-body">
        <form action={action}>
          <input type="hidden" name="country_code" value={countryCode} />

          {/* Eticheta adresa */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Eticheta (ex: Acasa, Birou)</label>
            <input name="address_name" style={inputStyle} placeholder="Acasa" />
          </div>

          <AddressFields prefix="" defaults={undefined} />

          {/* Campuri optionale */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Adresa (linie 2, optional)</label>
            <input name="address_2" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Companie (optional)</label>
            <input name="company" style={inputStyle} />
          </div>

          {/* Default flags */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "var(--f-sans)", fontSize: 14 }}>
              <input type="checkbox" name="is_default_shipping" style={{ width: 16, height: 16 }} />
              Livrare implicita
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "var(--f-sans)", fontSize: 14 }}>
              <input type="checkbox" name="is_default_billing" style={{ width: 16, height: 16 }} />
              Facturare implicita
            </label>
          </div>

          {state.error && (
            <p style={{ color: "var(--brand-600)", fontSize: 12, marginBottom: 8 }}>{state.error}</p>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="submit" className="btn primary sm">Salveaza adresa</button>
            <button type="button" className="btn ghost sm" onClick={() => setOpen(false)}>Anuleaza</button>
          </div>
        </form>
      </div>
    </div>
  )
}
