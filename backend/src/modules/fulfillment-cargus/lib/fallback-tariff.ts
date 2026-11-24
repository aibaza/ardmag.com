/**
 * PROVIZORIU, pana trimite clientul grila din contractul Cargus.
 *
 * Tarif de rezerva folosit numai cand API-ul Cargus nu da o cotatie. Treptele sunt
 * masurate live pe 24.11.2026 din grila contului (PriceTableId 293764
 * "Ab P1 26 S 100+10 12m"), origine Cluj-Napoca, plata expeditor, sume cu TVA 21%,
 * destinatii fara km suplimentari (Bucuresti, Iasi, Constanta, Turda, Vatra Dornei):
 *
 *   1-15 kg 44,00 | 16-20 kg 64,00 | 21-25 kg 75,00 | 26-31 kg 88,50
 *   32-40 kg 104,06 | 41-50 kg 125,84 | peste 50 kg (palet, serviciul 36) 397,49
 *
 * Componente masurate in acelasi cont (fara TVA): asigurare 1% din valoarea declarata,
 * ramburs 12 lei + 2% din suma incasata, km suplimentari ~27,69 lei (Borsa, Sulina).
 * Rotunjim in sus la leu intreg, ca rezerva sa nu incaseze mai putin decat Cargus.
 */
const VAT = 1.21
const INSURANCE_RATE = 0.01
const COD_FIXED_NET = 12
const COD_RATE = 0.02
export const CARGUS_REMOTE_SURCHARGE_RON = 34 // 27,69 + TVA = 33,50, rotunjit in sus

const WEIGHT_TIERS: Array<[maxKg: number, grossRon: number]> = [
  [15, 44],
  [20, 64],
  [25, 75],
  [31, 88.5],
  [40, 104.06],
  [50, 125.84],
]
const PALLET_RON = 397.49

export type CargusFallbackInput = {
  weightKg: number
  declaredValueRon: number
  // Valoarea produselor incasata la livrare; lipsa = fara ramburs.
  cashOnDeliveryGoodsRon?: number
  // Localitate negasita la Cargus: probabil sat cu km suplimentari.
  remoteLocality?: boolean
}

export function cargusWeightTierRon(weightKg: number): number {
  const kg = Math.max(1, Math.ceil(weightKg - 1e-9))
  for (const [max, price] of WEIGHT_TIERS) if (kg <= max) return price
  return PALLET_RON
}

export function fallbackTariff(input: CargusFallbackInput): number {
  const declared = Math.max(0, Number(input.declaredValueRon) || 0)
  let base = cargusWeightTierRon(input.weightKg) + declared * INSURANCE_RATE * VAT
  if (input.remoteLocality) base += CARGUS_REMOTE_SURCHARGE_RON
  const goods = input.cashOnDeliveryGoodsRon
  if (goods == null || !(goods >= 0)) return Math.ceil(base - 1e-9)
  // Rambursul include transportul: X = base + TVA*(12 + 2%*(goods + X)).
  const shipping = (base + VAT * (COD_FIXED_NET + COD_RATE * goods)) / (1 - VAT * COD_RATE)
  return Math.ceil(shipping - 1e-9)
}
