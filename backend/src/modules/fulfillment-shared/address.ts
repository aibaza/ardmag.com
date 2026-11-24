// Normalizarea adresei pentru cotatiile de curier.
// Fan Courier respinge diacriticele (HTTP 422 la "București", "Maramureș") si
// "Cluj - Napoca" cu spatii; un judet lipsa nu mai devine "Cluj" (cotatie gresita).

const LOCALITY_PREFIX = /^(municipiul|municipiu|mun|orasul|oras|or|comuna|com|satul|sat)\.?\s+/i

export function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "")
}

export function cleanAddressPart(value?: string | null): string {
  return stripDiacritics(String(value ?? ""))
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim()
}

function isBucharest(county: string): boolean {
  const key = county.toLowerCase().replace(/^ro-/, "").replace(/[^a-z]/g, "")
  return key === "bucuresti" || key === "b" || key === "municipiulbucuresti"
}

export type CourierDestination = { county: string; locality: string }

/** Judet si localitate curate, sau null daca lipseste vreuna (cotatia trece pe rezerva). */
export function normalizeCourierDestination(address?: {
  province?: string | null
  city?: string | null
} | null): CourierDestination | null {
  let county = cleanAddressPart(address?.province).replace(/^RO-/i, "")
  let locality = cleanAddressPart(address?.city).replace(LOCALITY_PREFIX, "")
  if (!county || !locality) return null
  if (isBucharest(county)) {
    county = "Bucuresti"
    locality = "Bucuresti"
  }
  return { county, locality }
}
