"use client"
import { useActionState, useState } from "react"
import { setAddresses } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { AddressFields } from "./AddressFieldsShared"
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
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input type="hidden" name="shipping_address.country_code" value="ro" />
      {!sameAsBilling && <input type="hidden" name="billing_address.country_code" value="ro" />}
      {!useNewShipping && <input type="hidden" name="shipping_address_id" value={selectedShippingId!} />}
      {!sameAsBilling && !useNewBilling && <input type="hidden" name="billing_address_id" value={selectedBillingId!} />}

      <h3 style={{ fontWeight: 600, margin: 0 }}>Adresa de livrare</h3>

      {!email && (
        <div className="field">
          <label>Email *</label>
          <div className="input-shell md">
            <input type="email" name="email" required />
          </div>
        </div>
      )}
      {email && <input type="hidden" name="email" value={email} />}

      {hasAddresses ? (
        <>
          <SavedAddressPicker
            addresses={savedAddresses}
            selectedId={selectedShippingId}
            onSelect={setSelectedShippingId}
            mode="shipping"
          />
          {useNewShipping && (
            <>
              <AddressFields prefix="shipping_address" defaults={cartShippingAddress ?? undefined} />
              {isLoggedIn && (
                <label className="check-row">
                  <input type="checkbox" name="save_to_account" defaultChecked />
                  <span className="check-box" />
                  <span className="label">Salveaza adresa in cont</span>
                </label>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <AddressFields prefix="shipping_address" defaults={cartShippingAddress ?? undefined} />
          {isLoggedIn && (
            <label className="check-row">
              <input type="checkbox" name="save_to_account" defaultChecked />
              <span className="check-box" />
              <span className="label">Salveaza adresa in cont</span>
            </label>
          )}
        </>
      )}

      <label className="check-row" style={{ marginTop: 4 }}>
        <input
          type="checkbox"
          id="same_as_billing"
          name="same_as_billing"
          checked={sameAsBilling}
          onChange={(e) => setSameAsBilling(e.target.checked)}
        />
        <span className="check-box" />
        <span className="label">Adresa de facturare este aceeasi cu cea de livrare</span>
      </label>

      {!sameAsBilling && (
        <>
          <h3 style={{ fontWeight: 600, margin: 0 }}>Adresa de facturare</h3>
          {hasAddresses ? (
            <>
              <SavedAddressPicker
                addresses={savedAddresses}
                selectedId={selectedBillingId}
                onSelect={setSelectedBillingId}
                mode="billing"
              />
              {useNewBilling && (
                <AddressFields prefix="billing_address" defaults={cartBillingAddress ?? undefined} />
              )}
            </>
          ) : (
            <AddressFields prefix="billing_address" defaults={cartBillingAddress ?? undefined} />
          )}
        </>
      )}

      {error && <p className="hint error">{error as string}</p>}

      <button type="submit" className="btn primary lg" style={{ width: "100%" }}>
        Continua spre livrare
      </button>
    </form>
  )
}
