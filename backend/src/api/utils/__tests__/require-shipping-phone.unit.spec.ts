import {
  SHIPPING_PHONE_REQUIRED_MESSAGE,
  requireShippingPhoneOnCartUpdate,
  requiresShippingPhoneError,
} from "../require-shipping-phone"
import middlewares from "../../middlewares"

describe("requiresShippingPhoneError", () => {
  it("allows cart updates that do not touch shipping_address", () => {
    expect(requiresShippingPhoneError({ region_id: "reg_123" })).toBeNull()
  })

  it("allows shipping_address with a non-empty phone", () => {
    expect(
      requiresShippingPhoneError({
        shipping_address: { address_1: "Vanatorului 6", phone: " 0722155441 " },
      })
    ).toBeNull()
  })

  it("rejects missing or whitespace-only shipping_address.phone", () => {
    expect(requiresShippingPhoneError({ shipping_address: { phone: "" } })).toBe(
      SHIPPING_PHONE_REQUIRED_MESSAGE
    )
    expect(requiresShippingPhoneError({ shipping_address: { phone: "   " } })).toBe(
      SHIPPING_PHONE_REQUIRED_MESSAGE
    )
    expect(requiresShippingPhoneError({ shipping_address: null })).toBe(
      SHIPPING_PHONE_REQUIRED_MESSAGE
    )
  })
})

describe("requireShippingPhoneOnCartUpdate", () => {
  it("is mounted on the Medusa Store API cart update route", () => {
    const route = middlewares.routes?.find((route) =>
      route.middlewares?.includes(requireShippingPhoneOnCartUpdate as any)
    )

    expect(route).toMatchObject({ matcher: "/store" })
    expect(route?.methods).toBeUndefined()
  })

  it("rejects direct cart updates with whitespace-only shipping phone", () => {
    const req = {
      method: "POST",
      originalUrl: "/store/carts/cart_123",
      body: {
        shipping_address: { address_1: "Vanatorului 6", phone: "   " },
      },
    } as any
    const json = jest.fn()
    const status = jest.fn(() => ({ json }))
    const res = { status } as any
    const next = jest.fn()

    requireShippingPhoneOnCartUpdate(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ message: SHIPPING_PHONE_REQUIRED_MESSAGE })
  })

  it("leaves other methods to Medusa without inspecting body parsing", () => {
    const req = {
      method: "GET",
      originalUrl: "/store/carts/cart_123",
      body: {
        shipping_address: { phone: "   " },
      },
    } as any
    const res = { status: jest.fn() } as any
    const next = jest.fn()

    requireShippingPhoneOnCartUpdate(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })

  it("leaves non-cart-update store requests to Medusa", () => {
    const req = {
      method: "POST",
      originalUrl: "/store/carts/cart_123/line-items",
      body: {
        shipping_address: { phone: "   " },
      },
    } as any
    const res = { status: jest.fn() } as any
    const next = jest.fn()

    requireShippingPhoneOnCartUpdate(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })
})
