import { FanCourierProviderService } from "../service"
import { getInternalTariff } from "../lib/api"

jest.mock("../lib/api", () => ({ getInternalTariff: jest.fn() }))
jest.mock("../lib/token-cache", () => ({ getToken: jest.fn().mockResolvedValue("t") }))
jest.mock("../lib/variant-weights", () => ({ fetchVariantWeights: jest.fn().mockResolvedValue(new Map()) }))

const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any
const items = [{ quantity: 1, variant: { weight: 2000 }, unit_price: 100 }]
const env = { ...process.env }

describe("FanCourierProviderService adresa", () => {
  beforeEach(() => {
    process.env.FAN_COURIER_USERNAME = "u"; process.env.FAN_COURIER_PASSWORD = "p"; process.env.FAN_COURIER_CLIENT_ID = "1"
    ;(getInternalTariff as jest.Mock).mockResolvedValue(24.89)
  })
  afterEach(() => { process.env = { ...env }; jest.clearAllMocks() })

  it("trimite judetul si localitatea fara diacritice si fara spatii in cratima", async () => {
    const service = new FanCourierProviderService({ logger })
    await expect(service.calculatePrice({}, {}, { items, shipping_address: { province: "Maramureș", city: "Sighetu  Marmației" } })).resolves.toMatchObject({ calculated_amount: 24.89 })
    await service.calculatePrice({}, {}, { items, shipping_address: { province: "Cluj", city: "Cluj - Napoca" } })
    const calls = (getInternalTariff as jest.Mock).mock.calls.map(([p]) => [p.county, p.locality])
    expect(calls).toEqual([["Maramures", "Sighetu Marmatiei"], ["Cluj", "Cluj-Napoca"]])
  })

  it("fara judet nu mai coteaza Cluj, ci tariful de rezerva", async () => {
    const service = new FanCourierProviderService({ logger })
    await expect(service.calculatePrice({}, {}, { items, shipping_address: { province: "", city: "Turda" } })).resolves.toMatchObject({ calculated_amount: 22 })
    expect(getInternalTariff).not.toHaveBeenCalled()
  })

  it("pastreaza gratuitatea peste 500 RON", async () => {
    const service = new FanCourierProviderService({ logger })
    await expect(service.calculatePrice({}, {}, { items: [{ quantity: 1, variant: { weight: 2000 }, subtotal: 500 }], shipping_address: { province: "Cluj", city: "Turda" } })).resolves.toMatchObject({ calculated_amount: 0 })
    expect(getInternalTariff).not.toHaveBeenCalled()
  })
})
