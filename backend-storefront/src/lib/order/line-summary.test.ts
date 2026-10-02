import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import ts from "typescript"
import { describe, expect, it } from "vitest"
import { getDisplayTotals } from "./display-totals"

function load(relative: string, mocks: Record<string, unknown>) {
  const jsx = (type: unknown, props: unknown) => ({ type, props })
  const code = ts.transpileModule(readFileSync(new URL(relative, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports: any = {}
  runInNewContext(code, { exports, require: (name: string) => name === "react/jsx-runtime"
    ? { jsx, jsxs: jsx } : mocks[name] ?? {} })
  return exports
}
function prices(node: any): string[] {
  if (!node || typeof node !== "object") return []
  return [...(node.type === "price" ? [node.props.value] : []),
    ...[node.props?.children].flat(Infinity).flatMap(prices)]
}
const cart = { items: [{ id: "line", unit_price: 76, quantity: 12, total: 729.6 }],
  item_total: 729.6, item_discount_total: 182.4, total: 729.6, currency_code: "ron" }
const shared = {
  "@lib/util/adapters/format-price": { formatPrice: (value: number) => String(value) },
  "@modules/@shared/components/formatted-price": { FormattedPrice: "price" },
}
describe("line prices and summary agree", () => {
  it("cart lines sum to the subtotal before the separately displayed discount", () => {
    const { CartLineItem } = load("../../modules/cart/components/CartLineItem.tsx", {
      ...shared, react: { useState: (value: unknown) => [value, () => {}],
        useRef: (value: unknown) => ({ current: value }) } })
    expect(prices(CartLineItem({ item: cart.items[0] }))).toEqual([String(getDisplayTotals(cart).subtotal)])
  })
  it("checkout review shows original line, original subtotal, discount, final total", async () => {
    const { CheckoutReview } = load("../../modules/checkout/components/CheckoutReview.tsx", {
      ...shared, "@lib/data/cart": { retrieveCart: async () => cart },
      "@lib/order/display-totals": { getDisplayTotals } })
    expect(prices(await CheckoutReview({ cartId: "cart_mock" }))).toEqual(["912", "912", "-182.4", "729.6"])
  })
})
