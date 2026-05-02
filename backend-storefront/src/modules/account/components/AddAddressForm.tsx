"use client"
import { useState, useActionState } from "react"
import { addCustomerAddress } from "@lib/data/customer"
import { AddressFields } from "@modules/checkout/components/AddressFieldsShared"

interface Props {
  countryCode: string
}

export function AddAddressForm({ countryCode }: Props) {
  const [open, setOpen] = useState(false)

  const [state, action] = useActionState(
    async (prev: { success: boolean; error: string | null }, formData: FormData) => {
      const result = await addCustomerAddress({}, formData)
      if (result?.success) setOpen(false)
      return result ?? { success: false, error: "Eroare necunoscuta" }
    },
    { success: false, error: null }
  )

  if (!open) {
    return (
      <button type="button" className="btn secondary md" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        + Adauga adresa noua
      </button>
    )
  }

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="panel-head">
        <h3>Adresa noua</h3>
      </div>
      <div className="panel-body padded">
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="hidden" name="country_code" value={countryCode} />

          <div className="field">
            <label>Eticheta (ex: Acasa, Birou)</label>
            <div className="input-shell md">
              <input name="address_name" placeholder="Acasa" />
            </div>
          </div>

          <AddressFields prefix="" defaults={undefined} />

          <div className="field">
            <label>Adresa linie 2 (optional)</label>
            <div className="input-shell md">
              <input name="address_2" />
            </div>
          </div>
          <div className="field">
            <label>Companie (optional)</label>
            <div className="input-shell md">
              <input name="company" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label className="check-row">
              <input type="checkbox" name="is_default_shipping" />
              <span className="check-box" />
              <span className="label">Livrare implicita</span>
            </label>
            <label className="check-row">
              <input type="checkbox" name="is_default_billing" />
              <span className="check-box" />
              <span className="label">Facturare implicita</span>
            </label>
          </div>

          {state.error && <p className="hint error">{state.error}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn primary sm">Salveaza adresa</button>
            <button type="button" className="btn ghost sm" onClick={() => setOpen(false)}>Anuleaza</button>
          </div>
        </form>
      </div>
    </div>
  )
}
