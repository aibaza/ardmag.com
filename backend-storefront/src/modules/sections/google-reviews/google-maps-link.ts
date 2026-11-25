// Linkul public spre profilul Google Maps al firmei. Adresa singură pune pinul greșit,
// de aceea căutarea pornește de la numele firmei (DC, 25.11.2026).
export const GOOGLE_MAPS_QUERY = "Arc Rom Diamonds Calea Baciului, Cluj-Napoca"

export function googleMapsProfileUrl(placeId?: string | null): string {
  const params = new URLSearchParams({ api: "1", query: GOOGLE_MAPS_QUERY })
  if (placeId) params.set("query_place_id", placeId)
  return `https://www.google.com/maps/search/?${params.toString()}`
}
