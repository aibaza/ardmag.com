"use client"
import { useState, useTransition, useActionState } from "react"
import { deleteCustomerAddress, updateCustomerAddress } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"

interface Props {
  address: HttpTypes.StoreCustomerAddress
  countryCode: string
}

export function AddressCard({ address, countryCode }: Props) {
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

  if (editing) {
    return (
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <h4 style={{ fontFamily: "var(--f-sans)", fontWeight: 600 }}>Editeaza adresa</h4>
        </div>
        <div className="panel-body">
          <form action={editAction}>
            <input type="hidden" name="addressId" value={address.id} />
            {(
              [
                ["Prenume", "first_name", address.first_name ?? ""],
                ["Nume", "last_name", address.last_name ?? ""],
                ["Adresa", "address_1", address.address_1 ?? ""],
                ["Oras", "city", address.city ?? ""],
                ["Cod postal", "postal_code", address.postal_code ?? ""],
                ["Judet", "province", address.province ?? ""],
                ["Telefon", "phone", address.phone ?? ""],
              ] as [string, string, string][]
            ).map(([label, name, def]) => (
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
                  defaultValue={def}
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
            <input type="hidden" name="country_code" value={countryCode} />
            {editState.error && (
              <p style={{ color: "red", fontSize: 12, marginBottom: 8 }}>{editState.error}</p>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn primary sm">
                Salveaza
              </button>
              <button type="button" className="btn ghost sm" onClick={() => setEditing(false)}>
                Anuleaza
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="panel" style={{ marginBottom: 16, opacity: isPending ? 0.5 : 1 }}>
      <div
        className="panel-body"
        style={{ fontFamily: "var(--f-sans)", fontSize: 14, lineHeight: 1.6 }}
      >
        <div style={{ fontWeight: 500 }}>
          {address.first_name} {address.last_name}
        </div>
        <div style={{ color: "var(--fg-muted)" }}>{address.address_1}</div>
        <div style={{ color: "var(--fg-muted)" }}>
          {address.postal_code} {address.city}
          {address.province ? `, ${address.province}` : ""}
        </div>
        {address.phone && <div style={{ color: "var(--fg-muted)" }}>{address.phone}</div>}
        {address.is_default_shipping && (
          <span className="badge stock-in" style={{ marginTop: 6, display: "inline-block" }}>
            Livrare implicita
          </span>
        )}
        {address.is_default_billing && (
          <span
            className="badge"
            style={{ marginTop: 6, marginLeft: 6, display: "inline-block" }}
          >
            Facturare implicita
          </span>
        )}
      </div>
      <div
        className="panel-head"
        style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 0 }}
      >
        <button type="button" className="btn ghost sm" onClick={() => setEditing(true)}>
          Editeaza
        </button>
        <button
          type="button"
          className="btn ghost sm"
          onClick={handleDelete}
          disabled={isPending}
        >
          Sterge
        </button>
      </div>
    </div>
  )
}
