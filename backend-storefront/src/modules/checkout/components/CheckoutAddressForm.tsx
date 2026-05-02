"use client"
import { useActionState, useState } from "react"
import { setAddresses } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { AddressFields, inputStyle, labelStyle } from "./AddressFieldsShared"
import { SavedAddressPicker } from "./SavedAddressPicker"

interface Props {
  countryCode: string
  customerEmail?: string
  customer?: HttpTypes.StoreCustomer | null
  cartShippingAddress?: HttpTypes.StoreCartAddress | null
  cartBillingAddress?: HttpTypes.StoreCartAddress | null
  cartEmail?: string | null
}

export function CheckoutAddressForm({
  countryCode,
  customerEmail,
  customer,
  cartShippingAddress,
  cartBillingAddress,
  cartEmail,
}: Props) {
  const savedAddresses = customer?.addresses ?? []
  const hasAddresses = savedAddresses.length > 0
  const isLoggedIn = !!customer

  const defaultShippingId =
    savedAddresses.find((a) => a.is_default_shipping)?.id ??
    savedAddresses[0]?.id ??
    null

  const defaultBillingId =
    savedAddresses.find((a) => a.is_default_billing)?.id ??
    savedAddresses[0]?.id ??
    null

  // null = "new address" mode; string = picked saved address
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    hasAddresses && !cartShippingAddress?.address_1 ? (defaultShippingId ?? null) : null
  )
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(
    hasAddresses && !cartBillingAddress?.address_1 ? (defaultBillingId ?? null) : null
  )
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [error, action] = useActionState(setAddresses, null)

  const useNewShipping = selectedShippingId === null
  const useNewBilling = selectedBillingId === null

  const email = cartEmail || customerEmail || ""

  return (
    <form action={action}>
      <input type="hidden" name="shipping_address.country_code" value="ro" />
      {!sameAsBilling && (
        <input type="hidden" name="billing_address.country_code" value="ro" />
      )}

      {/* Hidden field: saved address ID (when picker mode) */}
      {!useNewShipping && (
        <input type="hidden" name="shipping_address_id" value={selectedShippingId!} />
      )}
      {!sameAsBilling && !useNewBilling && (
        <input type="hidden" name="billing_address_id" value={selectedBillingId!} />
      )}

      <h3 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, marginBottom: 16 }}>
        Adresa de livrare
      </h3>

      {/* Email — afisat doar daca nu e logat sau cartul nu are email */}
      {!email && (
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Email *</label>
          <input type="email" name="email" required style={inputStyle} />
        </div>
      )}
      {email && <input type="hidden" name="email" value={email} />}

      {/* Shipping: picker sau form */}
      {hasAddresses ? (
        <>
          <SavedAddressPicker
            addresses={savedAddresses}
            selectedId={selectedShippingId}
            onSelect={setSelectedShippingId}
            mode="shipping"
          />
          {useNewShipping && (
            <div style={{ marginTop: 16 }}>
              <AddressFields prefix="shipping_address" defaults={cartShippingAddress ?? undefined} />
              {isLoggedIn && (
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer" }}>
                  <input type="checkbox" name="save_to_account" defaultChecked style={{ width: 16, height: 16 }} />
                  <span style={{ fontFamily: "var(--f-sans)", fontSize: 14 }}>Salveaza adresa in cont</span>
                </label>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <AddressFields prefix="shipping_address" defaults={cartShippingAddress ?? undefined} />
          {isLoggedIn && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer" }}>
              <input type="checkbox" name="save_to_account" defaultChecked style={{ width: 16, height: 16 }} />
              <span style={{ fontFamily: "var(--f-sans)", fontSize: 14 }}>Salveaza adresa in cont</span>
            </label>
          )}
        </>
      )}

      {/* Same-as-billing toggle */}
      <div style={{ margin: "16px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          id="same_as_billing"
          name="same_as_billing"
          checked={sameAsBilling}
          onChange={(e) => setSameAsBilling(e.target.checked)}
          style={{ width: 16, height: 16, cursor: "pointer" }}
        />
        <label htmlFor="same_as_billing" style={{ fontFamily: "var(--f-sans)", fontSize: 14, cursor: "pointer", color: "var(--fg-base)" }}>
          Adresa de facturare este aceeasi cu cea de livrare
        </label>
      </div>

      {/* Billing address block */}
      {!sameAsBilling && (
        <>
          <h3 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, marginBottom: 16, marginTop: 8 }}>
            Adresa de facturare
          </h3>
          {hasAddresses ? (
            <>
              <SavedAddressPicker
                addresses={savedAddresses}
                selectedId={selectedBillingId}
                onSelect={setSelectedBillingId}
                mode="billing"
              />
              {useNewBilling && (
                <div style={{ marginTop: 16 }}>
                  <AddressFields prefix="billing_address" defaults={cartBillingAddress ?? undefined} />
                </div>
              )}
            </>
          ) : (
            <AddressFields prefix="billing_address" defaults={cartBillingAddress ?? undefined} />
          )}
        </>
      )}

      {error && (
        <p style={{ color: "var(--brand-600)", fontSize: 13, marginBottom: 12 }}>
          {error as string}
        </p>
      )}

      <button type="submit" className="btn primary lg" style={{ width: "100%", marginTop: 8 }}>
        Continua spre livrare
      </button>
    </form>
  )
}
