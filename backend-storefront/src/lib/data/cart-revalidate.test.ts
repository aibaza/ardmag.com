import { beforeEach, describe, expect, it, vi } from "vitest"
const mock = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  revalidateTag: vi.fn(),
  fetch: vi.fn(),
  createLineItem: vi.fn(),
}))
vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (mock.cookies.has(name) ? { value: mock.cookies.get(name) } : undefined),
    set: vi.fn(),
  }),
}))
vi.mock("next/cache", () => ({ revalidateTag: mock.revalidateTag }))
vi.mock("next/navigation", () => ({ redirect: vi.fn() }))
vi.mock("@lib/config", () => ({
  sdk: { client: { fetch: mock.fetch }, store: { cart: { createLineItem: mock.createLineItem } } },
}))
vi.mock("./regions", () => ({ getRegion: async () => ({ id: "reg_ro" }) }))
vi.mock("@lib/data/locale-actions", () => ({ getLocale: async () => "ro" }))
import { getRevalidateTag } from "./cookies"
import { addToCart } from "./cart"

describe("invalidarea cosului", () => {
  beforeEach(() => {
    mock.cookies.clear()
    vi.clearAllMocks()
    mock.fetch.mockResolvedValue({ cart: { id: "cart_1", region_id: "reg_ro" } })
    mock.createLineItem.mockResolvedValue({ cart: { id: "cart_1" } })
  })

  it("fara cookie de cache invalideaza tagul global", async () => {
    expect(await getRevalidateTag("carts")).toBe("carts")
  })

  it("cu cookie de cache invalideaza tagul utilizatorului", async () => {
    mock.cookies.set("_medusa_cache_id", "abc")
    expect(await getRevalidateTag("carts")).toBe("carts-abc")
  })

  it("al doilea produs adaugat fara vizita in cos invalideaza cosul afisat", async () => {
    mock.cookies.set("_medusa_cart_id", "cart_1")
    await addToCart({ variantId: "variant_2", quantity: 1, countryCode: "ro" })
    expect(mock.createLineItem).toHaveBeenCalledWith("cart_1", { variant_id: "variant_2", quantity: 1 }, {}, {})
    expect(mock.revalidateTag).toHaveBeenCalledWith("carts")
    expect(mock.revalidateTag).toHaveBeenCalledWith("fulfillment")
    expect(mock.revalidateTag).not.toHaveBeenCalledWith("")
  })
})
