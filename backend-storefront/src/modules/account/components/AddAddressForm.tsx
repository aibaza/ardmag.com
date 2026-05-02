"use client"
import { useState, useActionState } from "react"
import { addCustomerAddress } from "@lib/data/customer"
import { AddressFields } from "@modules/checkout/components/AddressFieldsShared"

type EntityType = "none" | "pf" | "pj"

interface Props {
  countryCode: string
  isFirstAddress?: boolean
}

export function AddAddressForm({ countryCode, isFirstAddress = false }: Props) {
  const [open, setOpen] = useState(false)
  const [entityType, setEntityType] = useState<EntityType>("none")

  const [state, action] = useActionState(
    async (prev: { success: boolean; error: string | null }, formData: FormData) => {
      const result = await addCustomerAddress({}, formData)
      if (result?.success) { setOpen(false); setEntityType("none") }
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
          <input type="hidden" name="entity_type" value={entityType} />

          <div className="field">
            <label>Nume adresa (optional)</label>
            <div className="input-shell md">
              <input name="address_name" placeholder="ex: Acasa, Birou, Depozit" autoComplete="off" />
            </div>
          </div>

          <AddressFields prefix="" defaults={undefined} />

          <div className="field">
            <label>Bloc, scara, apartament (optional)</label>
            <div className="input-shell md">
              <input name="address_2" autoComplete="address-line2" />
            </div>
          </div>

          {/* Facturare */}
          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--f-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", marginBottom: 8 }}>
              Date facturare
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["none", "pf", "pj"] as EntityType[]).map((t) => {
                const labels = { none: "Fara factura", pf: "Persoana fizica", pj: "Firma" }
                return (
                  <button
                    key={t} type="button"
                    className={`btn sm ${entityType === t ? "primary" : "ghost"}`}
                    onClick={() => setEntityType(t)}
                  >
                    {labels[t]}
                  </button>
                )
              })}
            </div>
          </div>

          {entityType === "pf" && (
            <div className="field">
              <label>CNP *</label>
              <div className="input-shell md">
                <input name="cnp" required maxLength={13} minLength={13} inputMode="numeric"
                  placeholder="13 cifre" autoComplete="off" />
              </div>
            </div>
          )}

          {entityType === "pj" && (
            <div className="form-row-2">
              <div className="field">
                <label>Firma *</label>
                <div className="input-shell md">
                  <input name="company" required autoComplete="organization" />
                </div>
              </div>
              <div className="field">
                <label>CUI *</label>
                <div className="input-shell md">
                  <input name="cui" required placeholder="ex: RO12345678" autoComplete="off" />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <label className="check-row">
              <input type="checkbox" name="is_default_shipping" defaultChecked={isFirstAddress} />
              <span className="check-box" />
              <span className="label">Adresa implicita pentru livrare</span>
            </label>
            <label className="check-row">
              <input type="checkbox" name="is_default_billing" defaultChecked={isFirstAddress} />
              <span className="check-box" />
              <span className="label">Adresa implicita pentru facturare</span>
            </label>
          </div>

          {state.error && <p className="hint error">{state.error}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn primary sm">Salveaza adresa</button>
            <button type="button" className="btn ghost sm" onClick={() => { setOpen(false); setEntityType("none") }}>
              Anuleaza
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
