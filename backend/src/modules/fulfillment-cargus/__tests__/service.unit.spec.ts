import { CargusProviderService, cashOnDeliveryGoodsRon } from "../service"
import { CargusQuoteError, quoteCargus, quoteCargusCashOnDelivery } from "../lib/api"

jest.mock("../lib/api", () => {
  const actual = jest.requireActual("../lib/api")
  return { ...actual, quoteCargus: jest.fn(), quoteCargusCashOnDelivery: jest.fn() }
})
jest.mock("../../fulfillment-fan-courier/lib/variant-weights", () => ({
  fetchVariantWeights: jest.fn().mockResolvedValue(new Map()),
}))

const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any
const context = {
  items: [{ quantity: 1, variant: { weight: 1500 }, unit_price: 100 }],
  shipping_address: { province: "Cluj", city: "Turda", postal_code: "401001" },
}
const logged = () => [...logger.info.mock.calls, ...logger.warn.mock.calls].map(([m]) => m).join("\n")

describe("CargusProviderService", () => {
  const originalKey = process.env.CARGUS_API_KEY

  afterEach(() => {
    jest.clearAllMocks()
    if (originalKey === undefined) delete process.env.CARGUS_API_KEY
    else process.env.CARGUS_API_KEY = originalKey
  })

  it("foloseste tariful de rezerva pe greutate cand cheia lipseste", async () => {
    delete process.env.CARGUS_API_KEY
    const service = new CargusProviderService({ logger })
    // 2 kg facturabile -> 44 + asigurare 1,21 -> 46
    await expect(service.calculatePrice({}, {}, context)).resolves.toMatchObject({ calculated_amount: 46 })
    expect(quoteCargus).not.toHaveBeenCalled()
    expect(logged()).toContain("source=static-fallback reason=key-unset")
  })

  it("foloseste rezerva cand API-ul esueaza si scrie motivul", async () => {
    process.env.CARGUS_API_KEY = "test-only"
    ;(quoteCargus as jest.Mock).mockRejectedValue(new CargusQuoteError("timeout", "Cargus API timeout"))
    const service = new CargusProviderService({ logger })
    await expect(service.calculatePrice({}, {}, context)).resolves.toMatchObject({ calculated_amount: 46 })
    expect(logged()).toContain("source=static-fallback reason=timeout")
  })

  it("adauga km suplimentari in rezerva cand localitatea nu se gaseste", async () => {
    process.env.CARGUS_API_KEY = "test-only"
    ;(quoteCargus as jest.Mock).mockRejectedValue(new CargusQuoteError("locality-unmatched", "x"))
    const service = new CargusProviderService({ logger })
    await expect(service.calculatePrice({}, {}, context)).resolves.toMatchObject({ calculated_amount: 80 })
  })

  it("returneaza cotatia API valida pentru card, fara ramburs", async () => {
    process.env.CARGUS_API_KEY = "test-only"
    ;(quoteCargus as jest.Mock).mockResolvedValue(31.25)
    const service = new CargusProviderService({ logger })
    await expect(service.calculatePrice({}, {}, context)).resolves.toMatchObject({ calculated_amount: 31.25 })
    expect(quoteCargusCashOnDelivery).not.toHaveBeenCalled()
    expect((quoteCargus as jest.Mock).mock.calls[0][0]).toMatchObject({
      destination: { county: "Cluj", locality: "Turda", postalCode: "401001" },
      declaredValueRon: 100,
    })
    expect(logged()).toContain("source=cargus-api payment=card")
  })

  it("coteaza cu ramburs cand metoda de livrare a fost aleasa pentru plata ramburs", async () => {
    process.env.CARGUS_API_KEY = "test-only"
    ;(quoteCargusCashOnDelivery as jest.Mock).mockResolvedValue(62.4)
    const service = new CargusProviderService({ logger })
    const result = await service.calculatePrice({}, { payment: "cod" }, { ...context, item_total: 90 })
    expect(result).toMatchObject({ calculated_amount: 62.4 })
    expect((quoteCargusCashOnDelivery as jest.Mock).mock.calls[0][1]).toBe(90)
    expect(quoteCargus).not.toHaveBeenCalled()
    expect(logged()).toContain("payment=cod")
  })

  it("rezerva cu ramburs include comisionul de ramburs", async () => {
    delete process.env.CARGUS_API_KEY
    const service = new CargusProviderService({ logger })
    const card = await service.calculatePrice({}, {}, context)
    const cod = await service.calculatePrice({}, { payment: "cod" }, context)
    expect(cod.calculated_amount).toBeGreaterThan(card.calculated_amount + 14)
  })

  it("aplica gratuitatea peste 500 RON fara apel API, si la ramburs", async () => {
    process.env.CARGUS_API_KEY = "test-only"
    const service = new CargusProviderService({ logger })
    for (const data of [{}, { payment: "cod" }]) {
      const result = await service.calculatePrice({}, data, {
        ...context,
        items: [{ quantity: 1, variant: { weight: 1500 }, subtotal: 500 }],
      })
      expect(result).toMatchObject({ calculated_amount: 0 })
    }
    expect(quoteCargus).not.toHaveBeenCalled()
    expect(quoteCargusCashOnDelivery).not.toHaveBeenCalled()
  })

  it("pastreaza in datele metodei numai modul de plata", async () => {
    const service = new CargusProviderService({ logger })
    await expect(service.validateFulfillmentData({}, { payment: "cod", other: "x" }, {})).resolves.toEqual({ payment: "cod" })
    await expect(service.validateFulfillmentData({}, {}, {})).resolves.toEqual({ payment: "card" })
    await expect(service.validateFulfillmentData({}, { payment: "bitcoin" }, {})).resolves.toEqual({ payment: "card" })
  })

  it("suma incasata la ramburs foloseste totalul articolelor dupa reduceri", () => {
    expect(cashOnDeliveryGoodsRon({ item_total: 80 }, [{ quantity: 1, subtotal: 100 }])).toBe(80)
    expect(cashOnDeliveryGoodsRon({ item_total: { numeric: 75.5 } }, [])).toBe(75.5)
    expect(cashOnDeliveryGoodsRon({}, [{ quantity: 1, subtotal: 100, total: 90 } as any])).toBe(90)
    expect(cashOnDeliveryGoodsRon({}, [{ quantity: 2, unit_price: 30 }])).toBe(60)
  })
})
