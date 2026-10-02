import { beforeEach, describe, expect, it, vi } from "vitest"
const mock = vi.hoisted(() => ({ fetch: vi.fn(), complete: vi.fn(),
  removeCartId: vi.fn(), redirect: vi.fn(), revalidateTag: vi.fn() }))
vi.mock("@lib/config", () => ({ sdk: { client: { fetch: mock.fetch },
  store: { cart: { complete: mock.complete } } } }))
vi.mock("next/cache", () => ({ revalidateTag: mock.revalidateTag }))
vi.mock("next/navigation", () => ({ redirect: mock.redirect }))
vi.mock("./cookies", () => ({ getAuthHeaders: async () => ({}),
  getCacheOptions: async () => ({}), getCacheTag: async (tag: string) => tag,
  getCartId: async () => "cart_mock", removeCartId: mock.removeCartId }))
vi.mock("./regions", () => ({}))
vi.mock("@lib/data/locale-actions", () => ({}))
import { placeOrder } from "./cart"
describe("cart completion", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mock.fetch.mockResolvedValue({ cart: { id: "cart_mock", shipping_address: { phone: "0722000000" } } })
  })
  it("surfaces HTTP 200 completion errors without clearing the cart", async () => {
    mock.complete.mockResolvedValue({ type: "cart", cart: {}, error: { message: "Insufficient stock" } })
    expect(await placeOrder()).toBe("Insufficient stock")
    expect(mock.removeCartId).not.toHaveBeenCalled()
    expect(mock.redirect).not.toHaveBeenCalled()
  })
  it("handles backend rejection without leaking its internals", async () => {
    mock.complete.mockRejectedValue(new Error("private database details"))
    const result = await placeOrder()
    expect(result).toContain("Comanda nu a putut fi plasată")
    expect(result).not.toContain("private")
  })
  it("awaits cookie removal and preserves Next redirects on success", async () => {
    mock.complete.mockResolvedValue({ type: "order", order: { id: "order_mock" } })
    const redirectError = new Error("NEXT_REDIRECT")
    mock.redirect.mockImplementation(() => { throw redirectError })
    await expect(placeOrder()).rejects.toBe(redirectError)
    expect(mock.removeCartId).toHaveBeenCalledOnce()
    expect(mock.redirect).toHaveBeenCalledWith("/order/order_mock/confirmed")
  })
  it("does not complete carts missing a shipping phone", async () => {
    mock.fetch.mockResolvedValue({ cart: { shipping_address: {} } })
    expect(await placeOrder()).toContain("Telefon")
    expect(mock.complete).not.toHaveBeenCalled()
  })
})
