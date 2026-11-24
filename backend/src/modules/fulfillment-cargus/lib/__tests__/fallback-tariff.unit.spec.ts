import {
  CARGUS_REMOTE_SURCHARGE_RON,
  cargusWeightTierRon,
  fallbackTariff,
} from "../fallback-tariff";

describe("Cargus fallback tariff (provizoriu, masurat 24.11.2026)", () => {
  it.each([
    [0.3, 44], [1, 44], [5, 44], [15, 44], [15.2, 64], [20, 64], [21, 75], [25, 75],
    [26, 88.5], [31, 88.5], [32, 104.06], [40, 104.06], [41, 125.84], [50, 125.84], [51, 397.49], [120, 397.49],
  ])("treapta de greutate %p kg = %p lei", (kg, price) => {
    expect(cargusWeightTierRon(kg)).toBe(price);
  });

  // Cotatii reale Cargus (cu TVA) masurate live; rezerva nu are voie sa fie mai mica.
  it.each([
    ["Bucuresti 1 kg val 150", { weightKg: 1, declaredValueRon: 150 }, 45.81],
    ["Turda 2 kg val 100", { weightKg: 2, declaredValueRon: 100 }, 45.21],
    ["Iasi 5 kg val 300", { weightKg: 5, declaredValueRon: 300 }, 47.63],
    ["Constanta 20 kg val 450", { weightKg: 20, declaredValueRon: 450 }, 69.44],
    ["Bucuresti 1 kg val 499", { weightKg: 1, declaredValueRon: 499 }, 50.03],
    ["Bucuresti 50 kg val 0", { weightKg: 50, declaredValueRon: 0 }, 125.84],
    ["Bucuresti 1 kg ramburs, produse 150", { weightKg: 1, declaredValueRon: 150, cashOnDeliveryGoodsRon: 150 }, 65.55],
    ["Borsa 1 kg (km suplimentari)", { weightKg: 1, declaredValueRon: 0, remoteLocality: true }, 77.5],
  ] as Array<[string, Parameters<typeof fallbackTariff>[0], number]>)("%s: rezerva >= cotatia reala si cel mult 1 leu peste", (_label, input, real) => {
    const value = fallbackTariff(input);
    expect(value).toBeGreaterThanOrEqual(real);
    expect(value - real).toBeLessThan(input.remoteLocality ? 1.01 : 1);
    expect(Number.isInteger(value)).toBe(true);
  });

  it("adauga comisionul de ramburs care creste cu suma incasata", () => {
    const card = fallbackTariff({ weightKg: 1, declaredValueRon: 400 });
    const cod = fallbackTariff({ weightKg: 1, declaredValueRon: 400, cashOnDeliveryGoodsRon: 400 });
    expect(cod - card).toBeGreaterThan(14.5 + 0.0242 * 400 - 1);
  });

  it("supra-taxa pentru localitate negasita este km suplimentari cu TVA", () => {
    expect(CARGUS_REMOTE_SURCHARGE_RON).toBe(34);
    expect(fallbackTariff({ weightKg: 1, declaredValueRon: 0, remoteLocality: true })).toBe(78);
  });
});
