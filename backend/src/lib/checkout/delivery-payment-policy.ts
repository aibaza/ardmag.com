export const COD_PAYMENT_PROVIDER_ID = "pp_system_default";

// Cheia din shipping_method.data care spune cu ce plata a fost cotat Cargus.
export const CARGUS_PAYMENT_DATA_KEY = "payment";
export type CargusPaymentMode = "card" | "cod";

export type DeliveryKind = "fan-courier" | "cargus" | "other";

export type DeliveryDescriptor = {
  code?: string | null;
  providerId?: string | null;
  name?: string | null;
  // shipping_method.data salvat pe cos
  data?: Record<string, unknown> | null;
};

export type DeliveryPaymentValidation =
  | { valid: true; delivery: DeliveryKind }
  | { valid: false; delivery: DeliveryKind; message: string };

export const CARGUS_PAYMENT_MISMATCH_MESSAGE =
  "Costul livrării Cargus depinde de metoda de plată. Revino la pasul Plată și confirmă din nou metoda aleasă.";
export const COURIER_PAYMENT_UNSUPPORTED_MESSAGE =
  "Pentru livrarea prin curier poți plăti cu cardul sau ramburs.";

export function isStripeCardProvider(providerId?: string | null): boolean {
  if (!providerId) return false;
  return (
    providerId.includes("stripe") &&
    ![
      "oxxo",
      "ideal",
      "giropay",
      "blik",
      "bancontact",
      "przelewy",
      "promptpay",
    ].some((method) => providerId.includes(method))
  );
}

export function cargusPaymentMode(
  data?: Record<string, unknown> | null
): CargusPaymentMode {
  return data?.[CARGUS_PAYMENT_DATA_KEY] === "cod" ? "cod" : "card";
}

export function paymentModeForProvider(
  providerId?: string | null
): CargusPaymentMode | null {
  if (providerId === COD_PAYMENT_PROVIDER_ID) return "cod";
  if (isStripeCardProvider(providerId)) return "card";
  return null;
}

export function identifyDelivery(delivery: DeliveryDescriptor): DeliveryKind {
  const values = [delivery.code, delivery.providerId, delivery.name]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  if (
    values.some(
      (value) => value.includes("fan-courier") || value.includes("fan courier")
    )
  ) {
    return "fan-courier";
  }
  if (values.some((value) => value.includes("cargus"))) {
    return "cargus";
  }
  return "other";
}

/**
 * Decizia DC din 24.11.2026: Fan Courier si Cargus primesc ambele card si ramburs.
 * La Cargus rambursul are comision, deci cotatia salvata pe cos trebuie sa fie
 * facuta pentru aceeasi plata pe care o alege clientul.
 */
export function validateDeliveryPaymentPair(
  delivery: DeliveryDescriptor,
  paymentProviderId?: string | null
): DeliveryPaymentValidation {
  const kind = identifyDelivery(delivery);

  // Ridicarea personala si optiunile din afara curierilor isi pastreaza comportamentul.
  if (kind === "other") return { valid: true, delivery: kind };
  // Fara sesiune de plata nu avem ce verifica; Medusa refuza singur finalizarea.
  if (!paymentProviderId) return { valid: true, delivery: kind };

  const mode = paymentModeForProvider(paymentProviderId);
  if (!mode) {
    return {
      valid: false,
      delivery: kind,
      message: COURIER_PAYMENT_UNSUPPORTED_MESSAGE,
    };
  }
  if (kind === "cargus" && cargusPaymentMode(delivery.data) !== mode) {
    return {
      valid: false,
      delivery: kind,
      message: CARGUS_PAYMENT_MISMATCH_MESSAGE,
    };
  }
  return { valid: true, delivery: kind };
}
