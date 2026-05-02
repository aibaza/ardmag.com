"use client"
import { HttpTypes } from "@medusajs/types"

interface Props {
  addresses: HttpTypes.StoreCustomerAddress[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  mode: "shipping" | "billing"
}

function addressLabel(addr: HttpTypes.StoreCustomerAddress, index: number): string {
  return addr.address_name || `Adresa ${index + 1}`
}

function AddressSummary({ addr }: { addr: HttpTypes.StoreCustomerAddress }) {
  return (
    <span style={{ fontFamily: "var(--f-sans)", fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.5, display: "block" }}>
      {addr.first_name} {addr.last_name}
      {addr.address_1 && <>, {addr.address_1}</>}
      {addr.city && <>, {addr.city}</>}
      {addr.province && <>, {addr.province}</>}
    </span>
  )
}

export function SavedAddressPicker({ addresses, selectedId, onSelect, mode }: Props) {
  const defaultField = mode === "shipping" ? "is_default_shipping" : "is_default_billing"

  const sorted = [...addresses].sort((a, b) => {
    if ((a as any)[defaultField] && !(b as any)[defaultField]) return -1
    if (!(a as any)[defaultField] && (b as any)[defaultField]) return 1
    return 0
  })

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {sorted.map((addr, i) => {
          const isSelected = selectedId === addr.id
          const isDefault = (addr as any)[defaultField]
          return (
            <label
              key={addr.id}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 16px",
                border: `1px solid ${isSelected ? "var(--brand-600)" : "var(--rule)"}`,
                borderRadius: "var(--r-md)", cursor: "pointer",
                background: isSelected ? "var(--stone-50)" : "var(--bg-base)",
              }}
            >
              <input
                type="radio"
                name={`${mode}_address_id_radio`}
                value={addr.id}
                checked={isSelected}
                onChange={() => onSelect(addr.id)}
                style={{ marginTop: 3, flexShrink: 0, cursor: "pointer" }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: "var(--f-sans)", fontWeight: 500, fontSize: 14, display: "block" }}>
                  {addressLabel(addr, i)}
                  {isDefault && (
                    <span
                      className="badge stock-in"
                      style={{ marginLeft: 8, fontSize: 11, verticalAlign: "middle" }}
                    >
                      {mode === "shipping" ? "Livrare implicita" : "Facturare implicita"}
                    </span>
                  )}
                </span>
                <AddressSummary addr={addr} />
              </span>
            </label>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onSelect(null)}
        style={{
          background: "none", border: "none", padding: 0,
          fontFamily: "var(--f-mono)", fontSize: 13,
          color: "var(--brand-600)", cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        + Foloseste o adresa noua
      </button>
    </div>
  )
}
