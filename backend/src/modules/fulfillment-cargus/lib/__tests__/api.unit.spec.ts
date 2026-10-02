const input = { origin: { county: "Cluj", locality: "Cluj-Napoca" }, destination: { county: "CJ", locality: "Turda" }, parcels: 1, totalWeightKg: 1.5, declaredValueRon: 100, shipmentPayer: "sender" as const }
const original = { ...process.env }
let fetchMock: jest.Mock
beforeEach(() => { jest.resetModules(); process.env.CARGUS_API_KEY = "unit-key"; process.env.CARGUS_USERNAME = "unit-user"; process.env.CARGUS_PASSWORD = "unit-pass"; delete process.env.CARGUS_API_URL; delete process.env.CARGUS_PRICE_TABLE_ID; fetchMock = jest.fn(); global.fetch = fetchMock })
afterEach(() => { process.env = { ...original }; jest.restoreAllMocks() })
function replies(total: unknown = 31.25, tables = [{ PriceTableId: 7 }]) {
  fetchMock.mockImplementation(async (url: string) => {
    const values: Record<string, unknown> = { LoginUser: "unit-token", PriceTables: tables, Countries: [{ CountryId: 1, Abbreviation: "RO" }], "Counties?countryId=1": [{ CountyId: 5, Name: "Cluj", Abbreviation: "CJ" }], "Localities?countryId=1&countyId=5": [{ LocalityId: 10, Name: "Cluj Napoca" }, { LocalityId: 20, Name: "Turda" }], ShippingCalculation: { GrandTotal: total } }
    const path = url.split("/api/")[1]; if (!(path in values)) throw new Error("Unexpected API endpoint")
    return { ok: true, status: 200, json: async () => values[path] }
  })
}
it("authenticates and quotes contract/locality IDs with numeric payer and VAT-inclusive total", async () => {
  replies(); const { quoteCargus } = require("../api"); await expect(quoteCargus(input)).resolves.toBe(31.25)
  const login = fetchMock.mock.calls.find(([url]) => url.endsWith("/LoginUser"))[1]; expect(JSON.parse(login.body)).toEqual({ UserName: "unit-user", Password: "unit-pass" }); expect(login.headers.Authorization).toBeUndefined()
  const request = fetchMock.mock.calls.find(([url]) => url.endsWith("/ShippingCalculation"))[1]; expect(request.headers.Authorization).toBe("Bearer unit-token"); expect(request.redirect).toBe("error"); expect(JSON.parse(request.body)).toMatchObject({ FromLocalityId: 10, ToLocalityId: 20, PriceTableId: 7, ShipmentPayer: 1, TotalWeight: 1.5, CashRepayment: 0, ServiceId: 34 })
  await quoteCargus(input); expect(fetchMock.mock.calls.filter(([url]) => url.endsWith("/LoginUser"))).toHaveLength(1)
})
it.each([null, "", "invalid", -1])("rejects invalid GrandTotal %p", async total => { replies(total); const { quoteCargus } = require("../api"); await expect(quoteCargus(input)).rejects.toThrow("total") })
it("does not silently pick a contract when multiple price tables exist", async () => { replies(10, [{ PriceTableId: 7 }, { PriceTableId: 8 }]); await expect(require("../api").quoteCargus(input)).rejects.toThrow("ambiguous"); expect(fetchMock.mock.calls.some(([url]) => url.endsWith("/ShippingCalculation"))).toBe(false) })
it("uses the explicitly configured contracted price table", async () => { process.env.CARGUS_PRICE_TABLE_ID="8"; replies(10, [{ PriceTableId: 7 }, { PriceTableId: 8 }]); await expect(require("../api").quoteCargus(input)).resolves.toBe(10); expect(JSON.parse(fetchMock.mock.calls.find(([url]) => url.endsWith("/ShippingCalculation"))[1].body).PriceTableId).toBe(8) })
it("fails on missing locality rather than substituting Cluj", async () => { replies(); await expect(require("../api").quoteCargus({ ...input, destination: { county: "Cluj", locality: "" } })).rejects.toThrow("locality"); expect(fetchMock).not.toHaveBeenCalled() })
it("does not send credentials to a configured alternate endpoint", async () => { process.env.CARGUS_API_URL="https://example.com"; await expect(require("../api").quoteCargus(input)).rejects.toThrow("endpoint"); expect(fetchMock).not.toHaveBeenCalled() })
it("rejects incomplete WebExpress credentials", async () => { delete process.env.CARGUS_PASSWORD; await expect(require("../api").quoteCargus(input)).rejects.toThrow("credentials"); expect(fetchMock).not.toHaveBeenCalled() })
it("does not quote when LoginUser fails", async () => { fetchMock.mockResolvedValue({ ok: false, status: 500 }); await expect(require("../api").quoteCargus(input)).rejects.toThrow("HTTP 500"); expect(fetchMock).toHaveBeenCalledTimes(1) })
