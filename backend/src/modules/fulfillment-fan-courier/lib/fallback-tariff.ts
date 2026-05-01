export function fallbackTariff(kg: number): number {
  if (kg <= 1) return 18
  if (kg <= 5) return 22
  if (kg <= 10) return 28
  if (kg <= 20) return 38
  if (kg <= 31) return 50
  return 65
}
