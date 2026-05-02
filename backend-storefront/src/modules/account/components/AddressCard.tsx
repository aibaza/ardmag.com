"use client"
import { useState, useTransition, useActionState } from "react"
import { deleteCustomerAddress, updateCustomerAddress } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import { AddressFields, Field, PostalField, ProvinceSelect } from "@modules/checkout/components/AddressFieldsShared"
import { SetDefaultButtons } from "./SetDefaultButtons"

interface Props {
  address: HttpTypes.StoreCustomerAddress
  index: number
  countryCode: string
}

export function AddressCard({ address, index, countryCode }: Props) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

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

  if (editing) {
    return (
      <div className="panel" style={{ opacity: isPending ? 0.5 : 1 }}>
        <div className="panel-head">
          <h3>Editeaza adresa</h3>
        </div>
        <div className="panel-body padded">
          <form action={editAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="hidden" name="addressId" value={address.id} />
            <input type="hidden" name="country_code" value={countryCode} />

            <div className="field">
              <label>Eticheta (ex: Acasa, Birou)</label>
              <div className="input-shell md">
                <input name="address_name" defaultValue={address.address_name ?? ""} placeholder="Acasa" />
              </div>
            </div>

            <AddressFields prefix="" defaults={address} />

            <div className="field">
              <label>Adresa linie 2 (optional)</label>
              <div className="input-shell md">
                <input name="address_2" defaultValue={address.address_2 ?? ""} />
              </div>
            </div>
            <div className="field">
              <label>Companie (optional)</label>
              <div className="input-shell md">
                <input name="company" defaultValue={address.company ?? ""} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="check-row">
                <input type="checkbox" name="is_default_shipping" defaultChecked={address.is_default_shipping} />
                <span className="check-box" />
                <span className="label">Livrare implicita</span>
              </label>
              <label className="check-row">
                <input type="checkbox" name="is_default_billing" defaultChecked={address.is_default_billing} />
                <span className="check-box" />
                <span className="label">Facturare implicita</span>
              </label>
            </div>

            {editState.error && (
              <p className="hint error">{editState.error}</p>
            )}

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
    <div className="panel" style={{ opacity: isPending ? 0.5 : 1 }}>
      <div className="panel-head">
        <h3>{displayName}</h3>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {address.is_default_shipping && <span className="badge stock-in">Livrare implicita</span>}
          {address.is_default_billing && <span className="badge">Facturare implicita</span>}
        </div>
      </div>

      <div className="panel-body padded" style={{ fontSize: 14, lineHeight: 1.7 }}>
        <p style={{ margin: 0, fontWeight: 500 }}>{address.first_name} {address.last_name}</p>
        <p style={{ margin: 0, color: "var(--fg-muted)" }}>{address.address_1}{address.address_2 ? `, ${address.address_2}` : ""}</p>
        <p style={{ margin: 0, color: "var(--fg-muted)" }}>
          {address.postal_code} {address.city}{address.province ? `, ${address.province}` : ""}
        </p>
        {address.phone && <p style={{ margin: 0, color: "var(--fg-muted)" }}>{address.phone}</p>}
        {address.company && <p style={{ margin: "4px 0 0", color: "var(--fg-muted)", fontSize: 13 }}>{address.company}</p>}

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
