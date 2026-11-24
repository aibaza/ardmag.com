import { JUDETE_RO } from "@lib/data/romania"

export const PROVINCE_REQUIRED_MESSAGE = "Alege județul adresei de livrare din listă."

const key = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "")

const BY_KEY = new Map<string, string>(JUDETE_RO.map((j) => [key(j), j]))
BY_KEY.set("bucharest", "București")
BY_KEY.set("municipiulbucuresti", "București")

/** Judetul in forma din lista (cu diacritice), sau null daca nu e un judet romanesc. */
export function canonicalProvince(value?: string | null): string | null {
  const raw = String(value ?? "").trim().replace(/^ro-/i, "").replace(/^(judetul|judeţul|județul|jud\.?)\s+/i, "")
  if (!raw) return null
  return BY_KEY.get(key(raw)) ?? null
}

/** Orasul fara spatii in plus si fara spatii in jurul cratimei ("Cluj - Napoca" -> "Cluj-Napoca"). */
export function cleanCity(value?: string | null): string {
  return String(value ?? "").replace(/\s*-\s*/g, "-").replace(/\s+/g, " ").trim()
}
