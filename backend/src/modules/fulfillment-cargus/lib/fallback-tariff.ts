// PROVIZORIU: tariful static existent in repo, pana la confirmarea grilei contractuale Cargus.
export const CARGUS_PROVISIONAL_TARIFF_RON = 22.99;

export function fallbackTariff(_totalWeightKg: number): number {
  return CARGUS_PROVISIONAL_TARIFF_RON;
}
