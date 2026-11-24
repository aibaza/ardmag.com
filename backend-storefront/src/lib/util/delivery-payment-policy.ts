// Oglinda pentru storefront a politicii din backend (backend/src/lib/checkout/delivery-payment-policy.ts).
// Decizia DC din 24.11.2026: Fan Courier si Cargus primesc card si ramburs.
// La Cargus rambursul are comision, deci metoda de livrare se recoteaza pentru plata aleasa.

export const COD_PAYMENT_PROVIDER_ID = "pp_system_default"
export const CARGUS_PAYMENT_DATA_KEY = "payment"
export type CargusPaymentMode = "card" | "cod"
export type StorefrontDeliveryKind = "fan-courier" | "cargus" | "pickup" | "other"

type ShippingLike = {
  name?: string | null
  provider_id?: string | null
  type?: { code?: string | null } | null
  data?: Record<string, unknown> | null
}

export function deliveryKind(option?: ShippingLike | null): StorefrontDeliveryKind {
  const values = [option?.type?.code, option?.provider_id, option?.name]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
  if (values.some((v) => v.includes("fan-courier") || v.includes("fan courier"))) return "fan-courier"
  if (values.some((v) => v.includes("cargus"))) return "cargus"
  if (values.some((v) => v.includes("ridicare") || v.includes("pickup"))) return "pickup"
  return "other"
}

export function isStripeCardProvider(providerId?: string | null): boolean {
  if (!providerId) return false
  return (
    providerId.includes("stripe") &&
    !["oxxo", "ideal", "giropay", "blik", "bancontact", "przelewy", "promptpay"].some((m) =>
      providerId.includes(m)
    )
  )
}

export function paymentModeForProvider(providerId?: string | null): CargusPaymentMode | null {
  if (providerId === COD_PAYMENT_PROVIDER_ID) return "cod"
  if (isStripeCardProvider(providerId)) return "card"
  return null
}

export function cargusPaymentMode(data?: Record<string, unknown> | null): CargusPaymentMode {
  return data?.[CARGUS_PAYMENT_DATA_KEY] === "cod" ? "cod" : "card"
}

/** Cargus cotat pentru alta plata decat cea aleasa: trebuie recotat inainte de sesiunea de plata. */
export function cargusNeedsRequote(method: ShippingLike | null | undefined, providerId?: string | null): boolean {
  if (deliveryKind(method) !== "cargus") return false
  const mode = paymentModeForProvider(providerId)
  return mode != null && cargusPaymentMode(method?.data) !== mode
}

export function deliveryPaymentError(method: ShippingLike | null | undefined, providerId?: string | null): string | null {
  const kind = deliveryKind(method)
  if (kind !== "fan-courier" && kind !== "cargus") return null
  if (!providerId) return null
  if (!paymentModeForProvider(providerId)) return "Pentru livrarea prin curier poți plăti cu cardul sau ramburs."
  if (cargusNeedsRequote(method, providerId)) {
    return "Costul livrării Cargus depinde de metoda de plată. Revino la pasul Plată și confirmă din nou metoda aleasă."
  }
  return null
}
