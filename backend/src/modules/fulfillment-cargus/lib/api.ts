const BASE_URL = process.env.CARGUS_API_URL || "https://urgentcargus.azure-api.net/api"
const QUOTE_TIMEOUT_MS = 4000

export type CargusQuoteRequest = {
  origin: { county: string; locality: string }
  destination: { county: string; locality: string }
  parcels: number
  totalWeightKg: number
  declaredValueRon: number
  shipmentPayer: "sender"
}

export async function quoteCargus(input: CargusQuoteRequest): Promise<number> {
  const apiKey = process.env.CARGUS_API_KEY
  if (!apiKey) throw new Error("Cargus API key is not configured")

  const response = await fetch(`${BASE_URL}/ShippingCalculation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": apiKey,
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(QUOTE_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Cargus quote failed with status ${response.status}`)

  const body = await response.json() as Record<string, unknown>
  const total = Number(body.GrandTotal ?? body.grandTotal ?? body.total)
  if (!Number.isFinite(total) || total < 0) throw new Error("Cargus quote total is invalid")
  return Math.round(total * 100) / 100
}

