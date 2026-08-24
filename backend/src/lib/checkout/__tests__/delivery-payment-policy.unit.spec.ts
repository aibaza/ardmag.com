import {
  identifyDelivery,
  isStripeCardProvider,
  validateDeliveryPaymentPair,
} from "../delivery-payment-policy";

describe("delivery-payment-policy", () => {
  const fan = { code: "fan-courier", providerId: "fan-courier_fan-courier" };
  const cargus = { code: "cargus", providerId: "cargus_cargus" };
  const pickup = {
    code: "pickup-cluj",
    providerId: "manual_manual",
    name: "Ridicare Cluj",
  };

  it("identifica livrarea dupa cod, provider sau nume", () => {
    expect(identifyDelivery(fan)).toBe("fan-courier");
    expect(identifyDelivery({ name: "Cargus" })).toBe("cargus");
    expect(identifyDelivery(pickup)).toBe("other");
  });

  it("permite Fan doar cu ramburs", () => {
    expect(validateDeliveryPaymentPair(fan, "pp_system_default").valid).toBe(
      true
    );
    expect(validateDeliveryPaymentPair(fan, "pp_stripe_stripe").valid).toBe(
      false
    );
  });

  it("permite Cargus doar cu Stripe card", () => {
    expect(validateDeliveryPaymentPair(cargus, "pp_stripe_stripe").valid).toBe(
      true
    );
    expect(validateDeliveryPaymentPair(cargus, "pp_system_default").valid).toBe(
      false
    );
    expect(isStripeCardProvider("pp_stripe_ideal")).toBe(false);
  });

  it("nu schimba politica pentru Ridicare Cluj", () => {
    expect(validateDeliveryPaymentPair(pickup, "pp_system_default").valid).toBe(
      true
    );
    expect(validateDeliveryPaymentPair(pickup, "pp_stripe_stripe").valid).toBe(
      true
    );
  });
});
