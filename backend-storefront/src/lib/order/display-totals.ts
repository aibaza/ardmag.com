type Totals = {
  total?: number | null
  item_total?: number | null
  item_discount_total?: number | null
  discount_total?: number | null
  shipping_discount_total?: number | null
  shipping_total?: number | null
  tax_total?: number | null
}

// Store totals already include tax; show tax as an included amount, not an addition.
export function getDisplayTotals(source: Totals) {
  const total = source.total ?? 0
  const shipping = source.shipping_total ?? 0
  const discount =
    source.item_discount_total ??
    Math.max(
      0,
      (source.discount_total ?? 0) - (source.shipping_discount_total ?? 0)
    )
  const items = source.item_total ?? Math.max(0, total - shipping)
  return {
    subtotal: Math.round((items + discount) * 100) / 100,
    discount_total: discount,
    shipping_total: shipping,
    tax_total: source.tax_total ?? 0,
    total,
  }
}
