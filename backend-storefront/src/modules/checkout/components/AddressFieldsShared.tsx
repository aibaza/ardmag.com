import type { HttpTypes } from "@medusajs/types"
import { ProvinceCombobox } from "./ProvinceCombobox"

export function Field({
  label, name, type = "text", required = true, defaultValue = "",
  placeholder, autoComplete, inputMode,
}: {
  label: string; name: string; type?: string; required?: boolean
  defaultValue?: string; placeholder?: string
  autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  return (
    <div className="field">
      <label>{label}{required && " *"}</label>
      <div className="input-shell md">
        <input
          type={type} name={name} required={required} defaultValue={defaultValue}
          placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode}
        />
      </div>
    </div>
  )
}

export function PostalField({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  return (
    <div className="field">
      <label>Cod postal *</label>
      <div className="input-shell md">
        <input
          type="text" name={name} required maxLength={6} pattern="\d{6}"
          title="6 cifre" placeholder="400001" defaultValue={defaultValue}
          autoComplete="postal-code" inputMode="numeric"
        />
      </div>
    </div>
  )
}

export function ProvinceSelect({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  return <ProvinceCombobox name={name} defaultValue={defaultValue} />
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
      <div className="form-row-2">
        <Field label="Prenume" name={`${p}first_name`} defaultValue={(d as any).first_name ?? ""}
          autoComplete="given-name" />
        <Field label="Nume" name={`${p}last_name`} defaultValue={(d as any).last_name ?? ""}
          autoComplete="family-name" />
      </div>
      <Field label="Telefon" name={`${p}phone`} type="tel" defaultValue={(d as any).phone ?? ""}
        autoComplete="tel" inputMode="tel" />
      <Field label="Strada si numar" name={`${p}address_1`} defaultValue={(d as any).address_1 ?? ""}
        autoComplete="street-address" />
      <div className="form-row-3">
        <Field label="Localitate" name={`${p}city`} defaultValue={(d as any).city ?? ""}
          autoComplete="address-level2" />
        <ProvinceCombobox name={`${p}province`} defaultValue={(d as any).province ?? ""} />
        <PostalField name={`${p}postal_code`} defaultValue={(d as any).postal_code ?? ""} />
      </div>
    </>
  )
}
