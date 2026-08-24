import {
  CARGUS_PROVISIONAL_TARIFF_RON,
  fallbackTariff,
} from "../fallback-tariff";

describe("Cargus fallback tariff", () => {
  it("pastreaza tariful static provizoriu din repo indiferent de greutate", () => {
    expect(CARGUS_PROVISIONAL_TARIFF_RON).toBe(22.99);
    expect(fallbackTariff(0.5)).toBe(22.99);
    expect(fallbackTariff(40)).toBe(22.99);
  });
});
