import { JUDETE_RO } from "@lib/data/romania"
import type { HttpTypes } from "@medusajs/types"

export function Field({
  label, name, type = "text", required = true, defaultValue = "", placeholder,
}: {
  label: string; name: string; type?: string; required?: boolean
  defaultValue?: string; placeholder?: string
}) {
  return (
    <div className="field">
      <label>{label}{required && " *"}</label>
      <div className="input-shell md">
        <input type={type} name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} />
      </div>
    </div>
  )
}

export function PostalField({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  return (
    <div className="field">
      <label>Cod postal *</label>
      <div className="input-shell md">
        <input type="text" name={name} required maxLength={6} pattern="\d{6}" title="6 cifre" placeholder="400001" defaultValue={defaultValue} />
      </div>
    </div>
  )
}

export function ProvinceSelect({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  return (
    <div className="field">
      <label>Judet *</label>
      <div className="input-shell md">
        <select name={name} required defaultValue={defaultValue || ""}>
          <option value="" disabled>Selecteaza judetul</option>
          {JUDETE_RO.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function AddressFields({
  prefix,
  defaults,
}: {
  prefix: "shipping_address" | "billing_address" | ""
  defaults?: Partial<HttpTypes.StoreCartAddress | HttpTypes.StoreCustomerAddress>
}) {
  const p = prefix ? `${prefix}.` : ""
  const d = defaults ?? {}
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Prenume" name={`${p}first_name`} defaultValue={(d as any).first_name ?? ""} />
        <Field label="Nume" name={`${p}last_name`} defaultValue={(d as any).last_name ?? ""} />
      </div>
      <Field label="Telefon" name={`${p}phone`} type="tel" defaultValue={(d as any).phone ?? ""} />
      <Field label="Adresa" name={`${p}address_1`} defaultValue={(d as any).address_1 ?? ""} />
      <Field label="Oras" name={`${p}city`} defaultValue={(d as any).city ?? ""} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <PostalField name={`${p}postal_code`} defaultValue={(d as any).postal_code ?? ""} />
        <ProvinceSelect name={`${p}province`} defaultValue={(d as any).province ?? ""} />
      </div>
    </>
  )
}
