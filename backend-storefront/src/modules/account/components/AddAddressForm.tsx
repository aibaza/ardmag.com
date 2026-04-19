"use client"
import { useState, useActionState } from "react"
import { addCustomerAddress } from "@lib/data/customer"

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
          {(
            [
              ["Prenume", "first_name"],
              ["Nume", "last_name"],
              ["Adresa", "address_1"],
              ["Oras", "city"],
              ["Cod postal", "postal_code"],
              ["Judet", "province"],
              ["Telefon", "phone"],
            ] as [string, string][]
          ).map(([label, name]) => (
            <div key={name} style={{ marginBottom: 10 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--fg-muted)",
                  marginBottom: 3,
                  fontFamily: "var(--f-sans)",
                }}
              >
                {label}
              </label>
              <input
                name={name}
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--r-md)",
                  fontFamily: "var(--f-sans)",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
          {state.error && (
            <p style={{ color: "var(--brand-600)", fontSize: 12, marginBottom: 8 }}>{state.error}</p>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="submit" className="btn primary sm">
              Salveaza adresa
            </button>
            <button type="button" className="btn ghost sm" onClick={() => setOpen(false)}>
              Anuleaza
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
