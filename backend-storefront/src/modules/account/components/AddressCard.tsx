"use client"
import { useState, useTransition, useActionState } from "react"
import { deleteCustomerAddress, updateCustomerAddress } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import { AddressFields, inputStyle, labelStyle } from "@modules/checkout/components/AddressFieldsShared"
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
    async (
      prev: { success: boolean; error: string | null },
      formData: FormData
    ) => {
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
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <h4 style={{ fontFamily: "var(--f-sans)", fontWeight: 600 }}>Editeaza adresa</h4>
        </div>
        <div className="panel-body">
          <form action={editAction}>
            <input type="hidden" name="addressId" value={address.id} />
            <input type="hidden" name="country_code" value={countryCode} />

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Eticheta (ex: Acasa, Birou)</label>
              <input name="address_name" defaultValue={address.address_name ?? ""} style={inputStyle} placeholder="Acasa" />
            </div>

            <AddressFields prefix="" defaults={address} />

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Adresa (linie 2, optional)</label>
              <input name="address_2" defaultValue={address.address_2 ?? ""} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Companie (optional)</label>
              <input name="company" defaultValue={address.company ?? ""} style={inputStyle} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "var(--f-sans)", fontSize: 14 }}>
                <input type="checkbox" name="is_default_shipping" defaultChecked={address.is_default_shipping} style={{ width: 16, height: 16 }} />
                Livrare implicita
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "var(--f-sans)", fontSize: 14 }}>
                <input type="checkbox" name="is_default_billing" defaultChecked={address.is_default_billing} style={{ width: 16, height: 16 }} />
                Facturare implicita
              </label>
            </div>

            {editState.error && (
              <p style={{ color: "var(--brand-600)", fontSize: 12, marginBottom: 8 }}>{editState.error}</p>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn primary sm">Salveaza</button>
              <button type="button" className="btn ghost sm" onClick={() => setEditing(false)}>Anuleaza</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="panel" style={{ marginBottom: 16, opacity: isPending ? 0.5 : 1 }}>
      <div className="panel-body" style={{ fontFamily: "var(--f-sans)", fontSize: 14, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>{displayName}</div>
        <div style={{ fontWeight: 500 }}>{address.first_name} {address.last_name}</div>
        <div style={{ color: "var(--fg-muted)" }}>{address.address_1}</div>
        {address.address_2 && <div style={{ color: "var(--fg-muted)" }}>{address.address_2}</div>}
        <div style={{ color: "var(--fg-muted)" }}>
          {address.postal_code} {address.city}
          {address.province ? `, ${address.province}` : ""}
        </div>
        {address.phone && <div style={{ color: "var(--fg-muted)" }}>{address.phone}</div>}
        {address.company && <div style={{ color: "var(--fg-muted)" }}>{address.company}</div>}

        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {address.is_default_shipping && (
            <span className="badge stock-in">Livrare implicita</span>
          )}
          {address.is_default_billing && (
            <span className="badge">Facturare implicita</span>
          )}
        </div>

        <SetDefaultButtons
          addressId={address.id}
          isDefaultShipping={address.is_default_shipping}
          isDefaultBilling={address.is_default_billing}
        />
      </div>
      <div className="panel-head" style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 0 }}>
        <button type="button" className="btn ghost sm" onClick={() => setEditing(true)}>Editeaza</button>
        <button type="button" className="btn ghost sm" onClick={handleDelete} disabled={isPending}>Sterge</button>
      </div>
    </div>
  )
}
