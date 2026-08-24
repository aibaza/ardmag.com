export type StorefrontDeliveryKind = "fan-courier" | "cargus" | "pickup-cluj" | "other"

type ShippingLike = {
  name?: string | null
  provider_id?: string | null
  type?: { code?: string | null } | null
}

export function deliveryKind(option?: ShippingLike | null): StorefrontDeliveryKind {
  const values = [option?.type?.code, option?.provider_id, option?.name]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
  if (values.some((value) => value.includes("fan-courier") || value.includes("fan courier"))) return "fan-courier"
  if (values.some((value) => value.includes("cargus"))) return "cargus"
  if (values.some((value) => value.includes("pickup-cluj") || value.includes("ridicare cluj"))) return "pickup-cluj"
  return "other"
}

export function isStripeCardProvider(providerId: string): boolean {
  return providerId.includes("stripe") && ![
    "oxxo", "ideal", "giropay", "blik", "bancontact", "przelewy", "promptpay",
  ].some((method) => providerId.includes(method))
}

export function paymentAllowedForDelivery(kind: StorefrontDeliveryKind, providerId: string): boolean {
  if (kind === "fan-courier") return providerId === "pp_system_default"
  if (kind === "cargus") return isStripeCardProvider(providerId)
  return true
}

export function deliveryPaymentError(kind: StorefrontDeliveryKind, providerId?: string | null): string | null {
  if (kind === "fan-courier" && providerId !== "pp_system_default") {
    return "Fan Courier este disponibil doar cu plata ramburs."
  }
  if (kind === "cargus" && (!providerId || !isStripeCardProvider(providerId))) {
    return "Cargus este disponibil doar cu plata cu cardul."
  }
  return null
}

