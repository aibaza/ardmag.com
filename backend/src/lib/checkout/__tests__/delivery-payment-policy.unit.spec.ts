import {
  cargusPaymentMode,
  identifyDelivery,
  isStripeCardProvider,
  paymentModeForProvider,
  validateDeliveryPaymentPair,
} from "../delivery-payment-policy";

describe("delivery-payment-policy (decizia DC 24.11: card si ramburs la ambii curieri)", () => {
  const fan = { code: "fan-courier", providerId: "fan-courier_fan-courier" };
  const cargusCard = { code: "cargus", providerId: "cargus_cargus", data: { payment: "card" } };
  const cargusCod = { code: "cargus", providerId: "cargus_cargus", data: { payment: "cod" } };
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

  it("Fan accepta si ramburs, si card", () => {
    expect(validateDeliveryPaymentPair(fan, "pp_system_default").valid).toBe(true);
    expect(validateDeliveryPaymentPair(fan, "pp_stripe_stripe").valid).toBe(true);
  });

  it("Cargus accepta card si ramburs cand cotatia corespunde platii", () => {
    expect(validateDeliveryPaymentPair(cargusCard, "pp_stripe_stripe").valid).toBe(true);
    expect(validateDeliveryPaymentPair(cargusCod, "pp_system_default").valid).toBe(true);
    // cotatie veche fara date = card
    expect(validateDeliveryPaymentPair({ code: "cargus" }, "pp_stripe_stripe").valid).toBe(true);
  });

  it("Cargus refuza o cotatie facuta pentru alta plata, in ambele sensuri", () => {
    const a = validateDeliveryPaymentPair(cargusCard, "pp_system_default");
    const b = validateDeliveryPaymentPair(cargusCod, "pp_stripe_stripe");
    expect(a.valid).toBe(false);
    expect(b.valid).toBe(false);
    expect(!a.valid && a.message).toContain("Cargus");
  });

  it("curierii refuza metode Stripe care nu sunt card", () => {
    expect(isStripeCardProvider("pp_stripe_ideal")).toBe(false);
    expect(validateDeliveryPaymentPair(fan, "pp_stripe-ideal_stripe").valid).toBe(false);
    expect(paymentModeForProvider("pp_stripe_stripe")).toBe("card");
    expect(paymentModeForProvider("pp_system_default")).toBe("cod");
  });

  it("fara sesiune de plata nu blocheaza", () => {
    expect(validateDeliveryPaymentPair(cargusCod, null).valid).toBe(true);
  });

  it("modul Cargus implicit este card", () => {
    expect(cargusPaymentMode(undefined)).toBe("card");
    expect(cargusPaymentMode({ payment: "cod" })).toBe("cod");
  });

  it("nu schimba politica pentru Ridicare Cluj", () => {
    expect(validateDeliveryPaymentPair(pickup, "pp_system_default").valid).toBe(true);
    expect(validateDeliveryPaymentPair(pickup, "pp_stripe_stripe").valid).toBe(true);
  });
});
