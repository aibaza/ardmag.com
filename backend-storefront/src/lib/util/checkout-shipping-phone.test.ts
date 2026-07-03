import { describe, expect, it } from "vitest"
import {
  SHIPPING_PHONE_REQUIRED_MESSAGE,
  assertShippingPhone,
  hasShippingPhone,
} from "./checkout-shipping-phone"

describe("checkout shipping phone validation", () => {
  it("accepts a non-empty shipping phone", () => {
    expect(hasShippingPhone({ phone: "0722155441" } as any)).toBe(true)
    expect(() => assertShippingPhone({ phone: " 0722155441 " } as any)).not.toThrow()
  })

  it("rejects missing or whitespace-only shipping phone", () => {
    expect(hasShippingPhone(null)).toBe(false)
    expect(hasShippingPhone({ phone: "" } as any)).toBe(false)
    expect(hasShippingPhone({ phone: "   " } as any)).toBe(false)
    expect(() => assertShippingPhone({ phone: "   " } as any)).toThrow(
      SHIPPING_PHONE_REQUIRED_MESSAGE
    )
  })
})
