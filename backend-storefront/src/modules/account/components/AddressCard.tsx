"use client"
import { useState, useTransition, useActionState } from "react"
import { deleteCustomerAddress, updateCustomerAddress } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import { AddressFields } from "@modules/checkout/components/AddressFieldsShared"
import { SetDefaultButtons } from "./SetDefaultButtons"

type EntityType = "none" | "pf" | "pj"

interface Props {
  address: HttpTypes.StoreCustomerAddress
  index: number
  countryCode: string
}

function deriveEntityType(address: HttpTypes.StoreCustomerAddress): EntityType {
  const m = address.metadata as any
  if (m?.entity_type) return m.entity_type as EntityType
  if (m?.cui || address.company) return "pj"
  if (m?.cnp || m?.cnp_cui) return "pf"
  return "none"
}

export function AddressCard({ address, index, countryCode }: Props) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [entityType, setEntityType] = useState<EntityType>(deriveEntityType(address))

  const [editState, editAction] = useActionState(
    async (prev: { success: boolean; error: string | null }, formData: FormData) => {
      const result = await updateCustomerAddress({ addressId: address.id }, formData)
      if (result?.success) setEditing(false)
      return result ?? { success: false, error: "Eroare necunoscuta" }
    },
    { success: false, error: null }
  )

  function handleDelete() {
    if (!confirm("Stergi aceasta adresa?")) return
    startTransition(() => deleteCustomerAddress(address.id))
  }

  const displayName = address.address_name || `Adresa ${index + 1}`
  const m = address.metadata as any

  if (editing) {
    return (
      <div className="panel" style={{ opacity: isPending ? 0.5 : 1, marginBottom: 12 }}>
        <div className="panel-head">
          <h3>Editeaza adresa</h3>
        </div>
        <div className="panel-body padded">
          <form action={editAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="hidden" name="addressId" value={address.id} />
            <input type="hidden" name="country_code" value={countryCode} />
            <input type="hidden" name="entity_type" value={entityType} />

            <div className="field">
              <label>Nume adresa (optional)</label>
              <div className="input-shell md">
                <input name="address_name" defaultValue={address.address_name ?? ""} placeholder="ex: Acasa, Birou, Depozit" autoComplete="off" />
              </div>
            </div>

            <AddressFields prefix="" defaults={address} />

            <div className="field">
              <label>Bloc, scara, apartament (optional)</label>
              <div className="input-shell md">
                <input name="address_2" defaultValue={address.address_2 ?? ""} autoComplete="address-line2" />
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
                    <button key={t} type="button"
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
                    placeholder="13 cifre" autoComplete="off"
                    defaultValue={m?.cnp ?? m?.cnp_cui ?? ""} />
                </div>
              </div>
            )}

            {entityType === "pj" && (
              <div className="form-row-2">
                <div className="field">
                  <label>Firma *</label>
                  <div className="input-shell md">
                    <input name="company" required autoComplete="organization"
                      defaultValue={address.company ?? ""} />
                  </div>
                </div>
                <div className="field">
                  <label>CUI *</label>
                  <div className="input-shell md">
                    <input name="cui" required placeholder="ex: RO12345678" autoComplete="off"
                      defaultValue={m?.cui ?? m?.cnp_cui ?? ""} />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="check-row">
                <input type="checkbox" name="is_default_shipping" defaultChecked={address.is_default_shipping} />
                <span className="check-box" />
                <span className="label">Adresa implicita pentru livrare</span>
              </label>
              <label className="check-row">
                <input type="checkbox" name="is_default_billing" defaultChecked={address.is_default_billing} />
                <span className="check-box" />
                <span className="label">Adresa implicita pentru facturare</span>
              </label>
            </div>

            {editState.error && <p className="hint error">{editState.error}</p>}

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn primary sm">Salveaza</button>
              <button type="button" className="btn ghost sm" onClick={() => setEditing(false)}>Anuleaza</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="panel" style={{ opacity: isPending ? 0.5 : 1, marginBottom: 12 }}>
      <div className="panel-head">
        <h3>{displayName}</h3>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {address.is_default_shipping && <span className="badge stock-in">Livrare implicita</span>}
          {address.is_default_billing && <span className="badge">Facturare implicita</span>}
        </div>
      </div>

      <div className="panel-body padded" style={{ fontSize: 14, lineHeight: 1.8 }}>
        <p style={{ margin: 0, fontWeight: 500 }}>{address.first_name} {address.last_name}</p>
        <p style={{ margin: 0, color: "var(--fg-muted)" }}>
          {address.address_1}{address.address_2 ? `, ${address.address_2}` : ""}
        </p>
        <p style={{ margin: 0, color: "var(--fg-muted)" }}>
          {address.city}{address.province ? `, ${address.province}` : ""}{address.postal_code ? ` ${address.postal_code}` : ""}
        </p>
        {address.phone && <p style={{ margin: 0, color: "var(--fg-muted)" }}>{address.phone}</p>}

        {/* Date facturare */}
        {(m?.entity_type === "pj" || (!m?.entity_type && (address.company || m?.cui))) && (
          <p style={{ margin: "6px 0 0", color: "var(--fg-muted)", fontSize: 13 }}>
            {address.company && <span>{address.company}</span>}
            {(m?.cui || m?.cnp_cui) && <span>{address.company ? " · " : ""}CUI: {m.cui ?? m.cnp_cui}</span>}
          </p>
        )}
        {(m?.entity_type === "pf" || (!m?.entity_type && m?.cnp && !address.company)) && m?.cnp && (
          <p style={{ margin: "6px 0 0", color: "var(--fg-muted)", fontSize: 13 }}>
            CNP: {m.cnp}
          </p>
        )}
        {/* backward compat: old cnp_cui field without entity_type */}
        {!m?.entity_type && !m?.cnp && !m?.cui && m?.cnp_cui && (
          <p style={{ margin: "6px 0 0", color: "var(--fg-muted)", fontSize: 13 }}>
            CNP/CUI: {m.cnp_cui}
          </p>
        )}

        <SetDefaultButtons
          addressId={address.id}
          isDefaultShipping={address.is_default_shipping}
          isDefaultBilling={address.is_default_billing}
        />
      </div>

      <div className="panel-head" style={{ borderTop: "1px solid var(--rule)", borderBottom: "none", justifyContent: "flex-end", gap: 8 }}>
        <button type="button" className="btn ghost sm" onClick={() => setEditing(true)}>Editeaza</button>
        <button type="button" className="btn destructive sm" onClick={handleDelete} disabled={isPending}>Sterge</button>
      </div>
    </div>
  )
}
