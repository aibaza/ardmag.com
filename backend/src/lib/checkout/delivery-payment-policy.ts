export const COD_PAYMENT_PROVIDER_ID = "pp_system_default"

export type DeliveryKind = "fan-courier" | "cargus" | "other"

export type DeliveryDescriptor = {
  code?: string | null
  providerId?: string | null
  name?: string | null
}

export type DeliveryPaymentValidation =
  | { valid: true; delivery: DeliveryKind }
  | { valid: false; delivery: DeliveryKind; message: string }

export function isStripeCardProvider(providerId?: string | null): boolean {
  if (!providerId) return false
  return providerId.includes("stripe") && ![
    "oxxo", "ideal", "giropay", "blik", "bancontact", "przelewy", "promptpay",
  ].some((method) => providerId.includes(method))
}

export function identifyDelivery(delivery: DeliveryDescriptor): DeliveryKind {
  const values = [delivery.code, delivery.providerId, delivery.name]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())

  if (values.some((value) => value.includes("fan-courier") || value.includes("fan courier"))) {
    return "fan-courier"
  }
  if (values.some((value) => value.includes("cargus"))) {
    return "cargus"
  }
  return "other"
}

export function validateDeliveryPaymentPair(
  delivery: DeliveryDescriptor,
  paymentProviderId?: string | null
): DeliveryPaymentValidation {
  const kind = identifyDelivery(delivery)

  // Ridicarea Cluj si optiunile din afara noii mapari isi pastreaza comportamentul existent.
  if (kind === "other") return { valid: true, delivery: kind }

  if (kind === "fan-courier" && paymentProviderId === COD_PAYMENT_PROVIDER_ID) {
    return { valid: true, delivery: kind }
  }
  if (kind === "cargus" && isStripeCardProvider(paymentProviderId)) {
    return { valid: true, delivery: kind }
  }

  return {
    valid: false,
    delivery: kind,
    message: kind === "fan-courier"
      ? "Fan Courier este disponibil doar cu plata ramburs."
      : "Cargus este disponibil doar cu plata cu cardul.",
  }
}

