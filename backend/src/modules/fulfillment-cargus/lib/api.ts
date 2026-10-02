import { createHash } from "node:crypto"

export type CargusQuoteRequest = {
  origin: { county: string; locality: string }
  destination: { county: string; locality: string }
  parcels: number
  totalWeightKg: number
  declaredValueRon: number
  shipmentPayer: "sender"
}

// One budget bounds login, nomenclature lookup and quotation together.
const QUOTE_TIMEOUT_MS = 6000
const API_URL = "https://urgentcargus.azure-api.net/api"
let loginCache: { identity: string; token: string; expiresAt: number } | undefined
const lookupCache = new Map<string, { expiresAt: number; rows: Record<string, unknown>[] }>()
const normalize = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")

function validId(value: unknown): number {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") throw new Error("Cargus ID missing")
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Cargus ID invalid")
  return id
}

export async function quoteCargus(input: CargusQuoteRequest): Promise<number> {
  const key = process.env.CARGUS_API_KEY
  const username = process.env.CARGUS_USERNAME
  const password = process.env.CARGUS_PASSWORD
  if (!key || !username || !password) throw new Error("Cargus API credentials are incomplete")
  // Credential-bearing requests stay on the documented endpoint.
  const base = process.env.CARGUS_API_URL || API_URL
  if (base !== API_URL) throw new Error("Cargus API endpoint is not approved")
  if (!input.origin.county || !input.origin.locality || !input.destination.county || !input.destination.locality) throw new Error("Cargus complete locality required")
  if (!Number.isInteger(input.parcels) || input.parcels < 1 || !Number.isFinite(input.totalWeightKg) || input.totalWeightKg <= 0 || !Number.isFinite(input.declaredValueRon) || input.declaredValueRon < 0 || input.shipmentPayer !== "sender") throw new Error("Cargus shipment invalid")
  const identity = createHash("sha256").update(JSON.stringify([base, key, username, password])).digest("hex")
  const signal = AbortSignal.timeout(QUOTE_TIMEOUT_MS)
  async function call(path: string, token?: string, payload?: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${base}/${path}`, {
      method: payload ? "POST" : "GET", redirect: "error",
      headers: { "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": key!, "Ocp-Apim-Trace": "true", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: payload ? JSON.stringify(payload) : undefined, signal,
    })
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) { loginCache = undefined; lookupCache.clear() }
      throw new Error(`Cargus API HTTP ${response.status}`)
    }
    return response.json()
  }
  let token = loginCache?.identity === identity && loginCache.expiresAt > Date.now() ? loginCache.token : undefined
  if (!token) {
    const result = await call("LoginUser", undefined, { UserName: username, Password: password })
    const value = typeof result === "string" ? result : (result as Record<string, unknown> | null)?.Token
    if (typeof value !== "string" || !value.trim()) throw new Error("Cargus login token missing")
    token = value
    loginCache = { identity, token, expiresAt: Date.now() + 20 * 60 * 60 * 1000 }
  }
  async function rows(path: string): Promise<Record<string, unknown>[]> {
    const cacheKey = `${identity}:${path}`
    const cached = lookupCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) return cached.rows
    const result = await call(path, token)
    if (!Array.isArray(result) || result.some(r => !r || typeof r !== "object" || Array.isArray(r))) throw new Error("Cargus lookup response invalid")
    lookupCache.set(cacheKey, { rows: result, expiresAt: Date.now() + 30 * 60 * 1000 })
    return result
  }
  function unique(items: Record<string, unknown>[], matches: (r: Record<string, unknown>) => boolean, field: string): number {
    const found = items.filter(matches)
    if (found.length !== 1) throw new Error("Cargus contract or locality is ambiguous")
    return validId(found[0][field])
  }
  const tables = await rows("PriceTables")
  const configured = process.env.CARGUS_PRICE_TABLE_ID
  const priceTableId = unique(tables, row => configured ? validId(row.PriceTableId) === validId(configured) : true, "PriceTableId")
  const countries = await rows("Countries")
  const countryId = unique(countries, row => normalize(row.Abbreviation) === "ro", "CountryId")
  const counties = await rows(`Counties?countryId=${countryId}`)
  async function localityId(address: { county: string; locality: string }): Promise<number> {
    const countyId = unique(counties, row => normalize(row.Name) === normalize(address.county) || normalize(row.Abbreviation) === normalize(address.county.replace(/^RO-/i, "")), "CountyId")
    const localities = await rows(`Localities?countryId=${countryId}&countyId=${countyId}`)
    return unique(localities, row => normalize(row.Name) === normalize(address.locality), "LocalityId")
  }
  const from = await localityId(input.origin)
  const to = await localityId(input.destination)
  const result = await call("ShippingCalculation", token, {
    FromLocalityId: from, ToLocalityId: to, Parcels: input.parcels, Envelopes: 0,
    TotalWeight: input.totalWeightKg, ServiceId: input.totalWeightKg <= 31 ? 34 : input.totalWeightKg <= 50 ? 35 : 36,
    DeclaredValue: input.declaredValueRon, CashRepayment: 0, BankRepayment: 0,
    OtherRepayment: "", OpenPackage: false, PriceTableId: priceTableId, ShipmentPayer: 1,
  })
  const value = (result as Record<string, unknown> | null)?.GrandTotal
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") throw new Error("Cargus quote total missing")
  const total = Number(value)
  if (!Number.isFinite(total) || total < 0) throw new Error("Cargus quote total invalid")
  return Math.round(total * 100) / 100
}
