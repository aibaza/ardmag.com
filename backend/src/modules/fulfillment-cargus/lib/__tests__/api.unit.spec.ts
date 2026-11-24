const input = { origin: { county: "Cluj", locality: "Cluj-Napoca" }, destination: { county: "CJ", locality: "Turda" }, parcels: 1, totalWeightKg: 1.5, declaredValueRon: 100, shipmentPayer: "sender" as const }
const original = { ...process.env }
let fetchMock: jest.Mock
beforeEach(() => { jest.resetModules(); process.env.CARGUS_API_KEY = "unit-key"; process.env.CARGUS_USERNAME = "unit-user"; process.env.CARGUS_PASSWORD = "unit-pass"; delete process.env.CARGUS_API_URL; delete process.env.CARGUS_PRICE_TABLE_ID; fetchMock = jest.fn(); global.fetch = fetchMock })
afterEach(() => { process.env = { ...original }; jest.restoreAllMocks(); jest.useRealTimers() })

const localities: Record<string, unknown> = {
  "Localities?countryId=1&countyId=5": [{ LocalityId: 10, Name: "Cluj Napoca", PostalCode: "400001" }, { LocalityId: 20, Name: "Turda", PostalCode: "401001" }, { LocalityId: 30, Name: "Valea", PostalCode: "407001" }, { LocalityId: 31, Name: "Valea", PostalCode: "407002" }],
  "Localities?countryId=1&countyId=44": [{ LocalityId: 150, Name: "BUCURESTI", PostalCode: "" }],
}
function replies(total: unknown = 31.25, tables = [{ PriceTableId: 7 }], calc?: (body: any) => unknown) {
  fetchMock.mockImplementation(async (url: string, init: any) => {
    const values: Record<string, unknown> = { LoginUser: "unit-token", PriceTables: tables, Countries: [{ CountryId: 1, Abbreviation: "RO" }], "Counties?countryId=1": [{ CountyId: 5, Name: "Cluj", Abbreviation: "CJ" }, { CountyId: 44, Name: "Bucuresti", Abbreviation: "B" }], ...localities }
    const path = url.split("/api/")[1]
    if (path === "ShippingCalculation") return { ok: true, status: 200, json: async () => ({ GrandTotal: calc ? calc(JSON.parse(init.body)) : total }) }
    if (!(path in values)) throw new Error("Unexpected API endpoint")
    return { ok: true, status: 200, json: async () => values[path] }
  })
}
const calcBodies = () => fetchMock.mock.calls.filter(([url]) => url.endsWith("/ShippingCalculation")).map(([, init]) => JSON.parse(init.body))
const logins = () => fetchMock.mock.calls.filter(([url]) => url.endsWith("/LoginUser")).length

it("authenticates and quotes contract/locality IDs with numeric payer and VAT-inclusive total", async () => {
  replies(); const { quoteCargus } = require("../api"); await expect(quoteCargus(input)).resolves.toBe(31.25)
  const login = fetchMock.mock.calls.find(([url]) => url.endsWith("/LoginUser"))[1]; expect(JSON.parse(login.body)).toEqual({ UserName: "unit-user", Password: "unit-pass" }); expect(login.headers.Authorization).toBeUndefined()
  const request = fetchMock.mock.calls.find(([url]) => url.endsWith("/ShippingCalculation"))[1]; expect(request.headers.Authorization).toBe("Bearer unit-token"); expect(request.redirect).toBe("error")
  // Cargus accepta numai kilograme intregi: 1,5 kg se taxeaza 2 kg.
  expect(JSON.parse(request.body)).toMatchObject({ FromLocalityId: 10, ToLocalityId: 20, PriceTableId: 7, ShipmentPayer: 1, TotalWeight: 2, CashRepayment: 0, ServiceId: 34, SaturdayDelivery: false, MorningDelivery: false })
  await quoteCargus(input); expect(logins()).toBe(1)
})
it.each([[0.2, 1], [1, 1], [31, 31], [31.2, 32], [50.5, 51]])("rounds weight %p kg up to %p kg and picks the service", async (kg, billed) => {
  replies(); await require("../api").quoteCargus({ ...input, totalWeightKg: kg })
  const body = calcBodies()[0]; expect(body.TotalWeight).toBe(billed); expect(body.ServiceId).toBe(billed <= 31 ? 34 : billed <= 50 ? 35 : 36)
})
it.each([null, "", "invalid", -1])("rejects invalid GrandTotal %p", async total => { replies(total); const { quoteCargus } = require("../api"); await expect(quoteCargus(input)).rejects.toThrow("total") })
it("does not silently pick a contract when multiple price tables exist", async () => { replies(10, [{ PriceTableId: 7 }, { PriceTableId: 8 }]); await expect(require("../api").quoteCargus(input)).rejects.toThrow("ambiguous"); expect(calcBodies()).toHaveLength(0) })
it("uses the explicitly configured contracted price table", async () => { process.env.CARGUS_PRICE_TABLE_ID="8"; replies(10, [{ PriceTableId: 7 }, { PriceTableId: 8 }]); await expect(require("../api").quoteCargus(input)).resolves.toBe(10); expect(calcBodies()[0].PriceTableId).toBe(8) })
it("fails on missing locality rather than substituting Cluj", async () => { replies(); await expect(require("../api").quoteCargus({ ...input, destination: { county: "Cluj", locality: "" } })).rejects.toMatchObject({ reason: "input" }); expect(fetchMock).not.toHaveBeenCalled() })
it("fails on missing county rather than substituting Cluj", async () => { replies(); await expect(require("../api").quoteCargus({ ...input, destination: { county: " ", locality: "Turda" } })).rejects.toMatchObject({ reason: "input" }); expect(fetchMock).not.toHaveBeenCalled() })
it("does not send credentials to a configured alternate endpoint", async () => { process.env.CARGUS_API_URL="https://example.com"; await expect(require("../api").quoteCargus(input)).rejects.toThrow("endpoint"); expect(fetchMock).not.toHaveBeenCalled() })
it("rejects incomplete WebExpress credentials", async () => { delete process.env.CARGUS_PASSWORD; await expect(require("../api").quoteCargus(input)).rejects.toThrow("credentials"); expect(fetchMock).not.toHaveBeenCalled() })
it("does not quote when LoginUser fails", async () => { fetchMock.mockResolvedValue({ ok: false, status: 500 }); await expect(require("../api").quoteCargus(input)).rejects.toMatchObject({ reason: "login" }); expect(fetchMock).toHaveBeenCalledTimes(1) })

describe("address matching", () => {
  it("matches diacritics, spaced hyphens, RO- prefix and administrative prefixes", async () => {
    replies(); const { quoteCargus } = require("../api")
    await quoteCargus({ ...input, destination: { county: "RO-CJ", locality: "Cluj - Napoca" } })
    await quoteCargus({ ...input, destination: { county: "Cluj", locality: "Mun. Turda" } })
    expect(calcBodies().map(b => b.ToLocalityId)).toEqual([10, 20])
  })
  it("maps any Bucharest sector to the single Cargus locality", async () => {
    replies(); await require("../api").quoteCargus({ ...input, destination: { county: "București", locality: "Sector 3" } })
    expect(calcBodies()[0].ToLocalityId).toBe(150)
  })
  it("disambiguates duplicate or misspelled names by postal code", async () => {
    replies(); const { quoteCargus } = require("../api")
    await quoteCargus({ ...input, destination: { county: "Cluj", locality: "Valea", postalCode: "407002" } })
    await quoteCargus({ ...input, destination: { county: "Cluj", locality: "Turda Veche", postalCode: "401001" } })
    expect(calcBodies().map(b => b.ToLocalityId)).toEqual([31, 20])
  })
  it("reports an unmatched locality without tripping the cooldown", async () => {
    replies(); const api = require("../api")
    await expect(api.quoteCargus({ ...input, destination: { county: "Cluj", locality: "Valea" } })).rejects.toMatchObject({ reason: "locality-unmatched" })
    await expect(api.quoteCargus({ ...input, destination: { county: "Necunoscut", locality: "Turda" } })).rejects.toMatchObject({ reason: "county-unmatched" })
    expect(api.cargusCooldownRemainingMs()).toBe(0)
    await expect(api.quoteCargus(input)).resolves.toBe(31.25)
  })
  it("treats a rejected calculation (HTTP 400) as input, not as an outage", async () => {
    replies(); const api = require("../api")
    const base = fetchMock.getMockImplementation()!
    fetchMock.mockImplementation(async (url: string, init: any) => url.endsWith("/ShippingCalculation") ? { ok: false, status: 400 } : base(url, init))
    await expect(api.quoteCargus(input)).rejects.toMatchObject({ reason: "input" })
    expect(api.cargusCooldownRemainingMs()).toBe(0)
  })
})

describe("cooldown after API failures", () => {
  it("stops calling Cargus after a failed login and retries after the pause", async () => {
    jest.useFakeTimers({ now: new Date("2026-11-24T10:00:00Z"), doNotFake: ["nextTick", "setImmediate"] })
    fetchMock.mockResolvedValue({ ok: false, status: 500 })
    const api = require("../api")
    await expect(api.quoteCargus(input)).rejects.toMatchObject({ reason: "login" })
    await expect(api.quoteCargus(input)).rejects.toMatchObject({ reason: "cooldown" })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(api.cargusCooldownRemainingMs()).toBe(60_000)
    jest.setSystemTime(new Date("2026-11-24T10:01:01Z"))
    replies()
    await expect(api.quoteCargus(input)).resolves.toBe(31.25)
    expect(api.cargusCooldownRemainingMs()).toBe(0)
  })
  it("doubles the pause on consecutive failures, up to 10 minutes", async () => {
    jest.useFakeTimers({ now: new Date("2026-11-24T10:00:00Z"), doNotFake: ["nextTick", "setImmediate"] })
    fetchMock.mockResolvedValue({ ok: false, status: 503 })
    const api = require("../api")
    const waits: number[] = []
    for (let i = 0; i < 6; i++) {
      await expect(api.quoteCargus(input)).rejects.toBeTruthy()
      waits.push(api.cargusCooldownRemainingMs())
      jest.setSystemTime(Date.now() + api.cargusCooldownRemainingMs() + 1)
    }
    expect(waits).toEqual([60_000, 120_000, 240_000, 480_000, 600_000, 600_000])
  })
  it("trips on network timeouts", async () => {
    fetchMock.mockRejectedValue(Object.assign(new Error("aborted"), { name: "TimeoutError" }))
    const api = require("../api")
    await expect(api.quoteCargus(input)).rejects.toMatchObject({ reason: "timeout" })
    expect(api.cargusCooldownRemainingMs()).toBeGreaterThan(0)
  })
  it("shares one login between concurrent cold quotes", async () => {
    replies(); const { quoteCargus } = require("../api")
    await Promise.all([quoteCargus(input), quoteCargus(input), quoteCargus(input)])
    expect(logins()).toBe(1)
  })
})

describe("cash on delivery", () => {
  // Formula masurata pe contul ARDmag: (36,36 + 1% valoare + 12 + 2% ramburs) * 1,21
  const cargusLike = (b: any) => Math.round((36.36 + 0.01 * b.DeclaredValue + (b.CashRepayment > 0 ? 12 + 0.02 * b.CashRepayment : 0)) * 1.21 * 100) / 100
  it("sends CashRepayment and converges to the shipping that includes its own fee", async () => {
    replies(0, undefined, cargusLike); const { quoteCargusCashOnDelivery } = require("../api")
    const shipping = await quoteCargusCashOnDelivery({ ...input, declaredValueRon: 150 }, 150)
    expect(shipping).toBe(65.55) // verificat live 24.11: Bucuresti 1 kg, produse 150 lei
    const last = calcBodies().at(-1)
    expect(last.CashRepayment).toBeCloseTo(150 + shipping, 1)
    expect(cargusLike({ ...last, CashRepayment: 150 + shipping })).toBeCloseTo(shipping, 2)
    expect(calcBodies().length).toBeLessThanOrEqual(4)
  })
  it("plain quote never sends a repayment", async () => {
    replies(0, undefined, cargusLike); await require("../api").quoteCargus({ ...input, declaredValueRon: 150 })
    expect(calcBodies()[0].CashRepayment).toBe(0)
  })
})
