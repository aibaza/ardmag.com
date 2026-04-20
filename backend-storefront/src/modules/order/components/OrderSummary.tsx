interface OrderSummaryProps {
  subtotal: number
  discount_total?: number
  shipping_total?: number
  tax_total?: number
  total: number
  currency_code?: string
}

function fmt(amount: number, currency: string): string {
  return `${(amount / 100).toFixed(2).replace(".", ",")} ${currency.toUpperCase()}`
}

export function OrderSummary({
  subtotal,
  discount_total,
  shipping_total,
  tax_total,
  total,
  currency_code = "RON",
}: OrderSummaryProps) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Rezumat comanda</h3>
      </div>
      <div className="panel-body">
        <table className="spec-table">
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(subtotal, currency_code)}</td>
            </tr>
            {discount_total != null && discount_total > 0 && (
              <tr>
                <td>Reducere</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--brand-600)" }}>
                  -{fmt(discount_total, currency_code)}
                </td>
              </tr>
            )}
            {shipping_total != null && (
              <tr>
                <td>Transport</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(shipping_total, currency_code)}</td>
              </tr>
            )}
            {tax_total != null && tax_total > 0 && (
              <tr>
                <td>TVA</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(tax_total, currency_code)}</td>
              </tr>
            )}
            <tr style={{ fontWeight: 600 }}>
              <td>Total</td>
              <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(total, currency_code)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
