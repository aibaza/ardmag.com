import { createHash } from "node:crypto"

export type CargusQuoteRequest = {
  origin: { county: string; locality: string; postalCode?: string }
  destination: { county: string; locality: string; postalCode?: string }
  parcels: number
  totalWeightKg: number
  declaredValueRon: number
  shipmentPayer: "sender"
  // Suma incasata de curier la livrare (ramburs). 0 = fara ramburs.
  cashRepaymentRon?: number
}

// Motivele pentru care o cotatie nu iese. Numai cele de infrastructura opresc temporar apelurile.
export type CargusFailureReason =
  | "credentials"
  | "endpoint"
  | "input"
  | "county-unmatched"
  | "locality-unmatched"
  | "contract"
  | "login"
  | "api-error"
  | "timeout"
  | "cooldown"
  | "response"

export class CargusQuoteError extends Error {
  readonly reason: CargusFailureReason
  constructor(reason: CargusFailureReason, message: string) {
    super(message)
    this.name = "CargusQuoteError"
    this.reason = reason
  }
}

const TRIPPING_REASONS = new Set<CargusFailureReason>(["login", "api-error", "timeout"])

// One budget bounds login, nomenclature lookup and quotation together.
const QUOTE_TIMEOUT_MS = 6000
const API_URL = "https://urgentcargus.azure-api.net/api"
// Punct de pornire pentru iteratia ramburs; transportul tipic e 45-90 lei.
const COD_START_GUESS_RON = 60
const COOLDOWN_BASE_MS = 60 * 1000
const COOLDOWN_MAX_MS = 10 * 60 * 1000
// Cargus accepta numai kilograme intregi in ShippingCalculation (HTTP 400 la 1.5).
export const cargusBillableWeightKg = (kg: number) => Math.max(1, Math.ceil(kg - 1e-9))

let loginCache: { identity: string; token: string; expiresAt: number } | undefined
let loginInFlight: { identity: string; promise: Promise<string> } | undefined
const lookupCache = new Map<string, { expiresAt: number; rows: Record<string, unknown>[] }>()
let breaker = { failures: 0, openUntil: 0 }

export function __resetCargusStateForTests() {
  loginCache = undefined
  loginInFlight = undefined
  lookupCache.clear()
  breaker = { failures: 0, openUntil: 0 }
}

export function cargusCooldownRemainingMs(now = Date.now()): number {
  return Math.max(0, breaker.openUntil - now)
}

export const normalizeCargusName = (value: unknown) =>
  String(value ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")

// Prefixe administrative pe care clientii le scriu in campul oras ("Mun. Cluj-Napoca", "Comuna Floresti").
const LOCALITY_PREFIX = /^(municipiul|municipiu|mun|orasul|oras|or|comuna|com|satul|sat)\.?\s+/i
function localityKey(value: string): string {
  return normalizeCargusName(String(value ?? "").trim().replace(LOCALITY_PREFIX, ""))
}

function validId(value: unknown): number {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") throw new CargusQuoteError("response", "Cargus ID missing")
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id <= 0) throw new CargusQuoteError("response", "Cargus ID invalid")
  return id
}

function recordFailure(reason: CargusFailureReason) {
  if (!TRIPPING_REASONS.has(reason)) return
  breaker.failures += 1
  const wait = Math.min(COOLDOWN_MAX_MS, COOLDOWN_BASE_MS * 2 ** (breaker.failures - 1))
  breaker.openUntil = Date.now() + wait
}

function isBucharest(county: string): boolean {
  const key = normalizeCargusName(county.replace(/^RO-/i, ""))
  return key === "bucuresti" || key === "b" || key === "municipiulbucuresti"
}

export async function quoteCargus(input: CargusQuoteRequest, options: { signal?: AbortSignal } = {}): Promise<number> {
  const key = process.env.CARGUS_API_KEY
  const username = process.env.CARGUS_USERNAME
  const password = process.env.CARGUS_PASSWORD
  if (!key || !username || !password) throw new CargusQuoteError("credentials", "Cargus API credentials are incomplete")
  // Credential-bearing requests stay on the documented endpoint.
  const base = process.env.CARGUS_API_URL || API_URL
  if (base !== API_URL) throw new CargusQuoteError("endpoint", "Cargus API endpoint is not approved")
  if (!input.origin.county?.trim() || !input.origin.locality?.trim() || !input.destination.county?.trim() || !input.destination.locality?.trim()) throw new CargusQuoteError("input", "Cargus complete locality required")
  const cash = input.cashRepaymentRon ?? 0
  if (!Number.isInteger(input.parcels) || input.parcels < 1 || !Number.isFinite(input.totalWeightKg) || input.totalWeightKg <= 0 || !Number.isFinite(input.declaredValueRon) || input.declaredValueRon < 0 || !Number.isFinite(cash) || cash < 0 || input.shipmentPayer !== "sender") throw new CargusQuoteError("input", "Cargus shipment invalid")
  if (cargusCooldownRemainingMs() > 0) throw new CargusQuoteError("cooldown", "Cargus API cooldown after recent failures")

  try {
    const total = await quoteOnce(input, { key, username, password, base }, cash, options.signal ?? AbortSignal.timeout(QUOTE_TIMEOUT_MS))
    breaker = { failures: 0, openUntil: 0 }
    return total
  } catch (error) {
    const reason: CargusFailureReason = error instanceof CargusQuoteError
      ? error.reason
      : (error as Error)?.name === "TimeoutError" || (error as Error)?.name === "AbortError" ? "timeout" : "api-error"
    recordFailure(reason)
    if (error instanceof CargusQuoteError) throw error
    throw new CargusQuoteError(reason, reason === "timeout" ? "Cargus API timeout" : "Cargus API request failed")
  }
}

async function quoteOnce(
  input: CargusQuoteRequest,
  creds: { key: string; username: string; password: string; base: string },
  cash: number,
  signal: AbortSignal
): Promise<number> {
  const { key, username, password, base } = creds
  const identity = createHash("sha256").update(JSON.stringify([base, key, username, password])).digest("hex")
  async function call(path: string, token?: string, payload?: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${base}/${path}`, {
      method: payload ? "POST" : "GET", redirect: "error",
      headers: { "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": key, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: payload ? JSON.stringify(payload) : undefined, signal,
    })
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) { loginCache = undefined; lookupCache.clear() }
      // 400/404/409/422 la calcul inseamna date de livrare respinse, nu API cazut.
      const reason: CargusFailureReason = path === "LoginUser" ? "login" : response.status >= 500 || response.status === 401 || response.status === 403 || response.status === 429 ? "api-error" : "input"
      throw new CargusQuoteError(reason, `Cargus API HTTP ${response.status}`)
    }
    return response.json()
  }
  async function login(): Promise<string> {
    if (loginCache?.identity === identity && loginCache.expiresAt > Date.now()) return loginCache.token
    if (loginInFlight?.identity === identity) return loginInFlight.promise
    const promise = (async () => {
      const result = await call("LoginUser", undefined, { UserName: username, Password: password })
      const value = typeof result === "string" ? result : (result as Record<string, unknown> | null)?.Token
      if (typeof value !== "string" || !value.trim()) throw new CargusQuoteError("login", "Cargus login token missing")
      loginCache = { identity, token: value, expiresAt: Date.now() + 20 * 60 * 60 * 1000 }
      return value
    })()
    loginInFlight = { identity, promise }
    try { return await promise } finally { if (loginInFlight?.promise === promise) loginInFlight = undefined }
  }
  const token = await login()
  async function rows(path: string): Promise<Record<string, unknown>[]> {
    const cacheKey = `${identity}:${path}`
    const cached = lookupCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) return cached.rows
    const result = await call(path, token)
    if (!Array.isArray(result) || result.some(r => !r || typeof r !== "object" || Array.isArray(r))) throw new CargusQuoteError("response", "Cargus lookup response invalid")
    lookupCache.set(cacheKey, { rows: result, expiresAt: Date.now() + 30 * 60 * 1000 })
    return result
  }
  function unique(items: Record<string, unknown>[], matches: (r: Record<string, unknown>) => boolean, field: string, reason: CargusFailureReason): number {
    const found = items.filter(matches)
    if (found.length !== 1) throw new CargusQuoteError(reason, "Cargus contract or locality is ambiguous")
    return validId(found[0][field])
  }
  const tables = await rows("PriceTables")
  const configured = process.env.CARGUS_PRICE_TABLE_ID
  const priceTableId = unique(tables, row => configured ? validId(row.PriceTableId) === validId(configured) : true, "PriceTableId", "contract")
  const countries = await rows("Countries")
  const countryId = unique(countries, row => normalizeCargusName(row.Abbreviation) === "ro", "CountryId", "response")
  const counties = await rows(`Counties?countryId=${countryId}`)
  async function localityId(address: { county: string; locality: string; postalCode?: string }): Promise<number> {
    const county = address.county.trim().replace(/^RO-/i, "")
    const countyId = unique(counties, row => normalizeCargusName(row.Name) === normalizeCargusName(county) || normalizeCargusName(row.Abbreviation) === normalizeCargusName(county), "CountyId", "county-unmatched")
    const localities = await rows(`Localities?countryId=${countryId}&countyId=${countyId}`)
    // Bucuresti are o singura localitate la Cargus; "Sector 3" sau "Bucuresti S3" nu se potrivesc pe nume.
    if (isBucharest(county) && localities.length === 1) return validId(localities[0].LocalityId)
    const wanted = localityKey(address.locality)
    const byName = localities.filter(row => localityKey(String(row.Name ?? "")) === wanted)
    if (byName.length === 1) return validId(byName[0].LocalityId)
    // Nume dublat in judet sau scris altfel: codul postal unic decide.
    const postal = String(address.postalCode ?? "").replace(/\D/g, "")
    if (postal.length === 6) {
      const pool = byName.length > 1 ? byName : localities
      const byPostal = pool.filter(row => String(row.PostalCode ?? "").replace(/\D/g, "") === postal)
      if (byPostal.length === 1) return validId(byPostal[0].LocalityId)
    }
    throw new CargusQuoteError("locality-unmatched", "Cargus locality not matched")
  }
  const from = await localityId(input.origin)
  const to = await localityId(input.destination)
  const weight = cargusBillableWeightKg(input.totalWeightKg)
  const result = await call("ShippingCalculation", token, {
    FromLocalityId: from, ToLocalityId: to, Parcels: input.parcels, Envelopes: 0,
    TotalWeight: weight, ServiceId: weight <= 31 ? 34 : weight <= 50 ? 35 : 36,
    DeclaredValue: Math.round(input.declaredValueRon * 100) / 100,
    CashRepayment: Math.round(cash * 100) / 100, BankRepayment: 0,
    OtherRepayment: "", OpenPackage: false, SaturdayDelivery: false, MorningDelivery: false,
    PriceTableId: priceTableId, ShipmentPayer: 1,
  })
  const value = (result as Record<string, unknown> | null)?.GrandTotal
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") throw new CargusQuoteError("response", "Cargus quote total missing")
  const total = Number(value)
  if (!Number.isFinite(total) || total < 0) throw new CargusQuoteError("response", "Cargus quote total invalid")
  return Math.round(total * 100) / 100
}

/**
 * Cotatie cu ramburs. Comisionul Cargus depinde de suma incasata, iar suma incasata
 * contine chiar transportul, deci iteram pana se stabilizeaza (de obicei 3 apeluri).
 * Rezultatul este transportul X pentru care ramburs = produse + X.
 */
export async function quoteCargusCashOnDelivery(
  input: Omit<CargusQuoteRequest, "cashRepaymentRon">,
  goodsAmountRon: number,
  maxIterations = 4
): Promise<number> {
  if (!Number.isFinite(goodsAmountRon) || goodsAmountRon < 0) throw new CargusQuoteError("input", "Cargus cash amount invalid")
  // Acelasi buget de 6 s pentru toate apelurile cotatiei.
  const signal = AbortSignal.timeout(QUOTE_TIMEOUT_MS)
  let shipping = COD_START_GUESS_RON
  let best = 0
  for (let i = 0; i < maxIterations; i++) {
    const next = await quoteCargus({ ...input, cashRepaymentRon: goodsAmountRon + shipping }, { signal })
    best = Math.max(best, next)
    if (Math.abs(next - shipping) < 0.01) return next
    shipping = next
  }
  // Fara convergenta (rotunjiri): nu incasam mai putin decat cea mai mare cotatie vazuta.
  return best
}
