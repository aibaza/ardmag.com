import { CargusProviderService } from "../service"
import { quoteCargus } from "../lib/api"

jest.mock("../lib/api", () => ({ quoteCargus: jest.fn() }))
jest.mock("../../fulfillment-fan-courier/lib/variant-weights", () => ({
  fetchVariantWeights: jest.fn().mockResolvedValue(new Map()),
}))

const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any
const context = {
  items: [{ quantity: 1, variant: { weight: 1500 }, unit_price: 100 }],
  shipping_address: { province: "Cluj", city: "Turda" },
}

describe("CargusProviderService", () => {
  const originalKey = process.env.CARGUS_API_KEY

  afterEach(() => {
    jest.clearAllMocks()
    if (originalKey === undefined) delete process.env.CARGUS_API_KEY
    else process.env.CARGUS_API_KEY = originalKey
  })

  it("foloseste fallback-ul cand cheia lipseste", async () => {
    delete process.env.CARGUS_API_KEY
    const service = new CargusProviderService({ logger })
    await expect(service.calculatePrice({}, {}, context)).resolves.toMatchObject({ calculated_amount: 22.99 })
    expect(quoteCargus).not.toHaveBeenCalled()
  })

  it("foloseste fallback-ul cand API-ul esueaza", async () => {
    process.env.CARGUS_API_KEY = "test-only"
    ;(quoteCargus as jest.Mock).mockRejectedValue(new Error("timeout"))
    const service = new CargusProviderService({ logger })
    await expect(service.calculatePrice({}, {}, context)).resolves.toMatchObject({ calculated_amount: 22.99 })
  })

  it("returneaza cotația API valida", async () => {
    process.env.CARGUS_API_KEY = "test-only"
    ;(quoteCargus as jest.Mock).mockResolvedValue(31.25)
    const service = new CargusProviderService({ logger })
    await expect(service.calculatePrice({}, {}, context)).resolves.toMatchObject({ calculated_amount: 31.25 })
  })

  it("aplica gratuitatea peste 500 RON fara apel API", async () => {
    process.env.CARGUS_API_KEY = "test-only"
    const service = new CargusProviderService({ logger })
    const result = await service.calculatePrice({}, {}, {
      ...context,
      items: [{ quantity: 1, variant: { weight: 1500 }, subtotal: 500 }],
    })
    expect(result).toMatchObject({ calculated_amount: 0 })
    expect(quoteCargus).not.toHaveBeenCalled()
  })
})
