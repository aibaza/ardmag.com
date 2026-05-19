import { formatPrice } from "@lib/util/adapters/format-price"
import { FormattedPrice } from "@modules/@shared/components/formatted-price"

interface OrderSummaryProps {
  subtotal: number
  discount_total?: number
  shipping_total?: number
  tax_total?: number
  total: number
  currency_code?: string
}

const fmt = (amount: number, currency: string) => formatPrice(amount, currency)

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  padding: "10px 20px",
  borderBottom: "1px solid var(--rule)",
  fontSize: 13,
}

const labelStyle: React.CSSProperties = {
  color: "var(--fg-muted)",
}

const valueStyle: React.CSSProperties = {
  fontFamily: "var(--f-mono)",
  fontVariantNumeric: "tabular-nums",
  fontSize: 13,
}

export function OrderSummary({
  subtotal,
  discount_total,
  shipping_total,
  tax_total,
  total,
  currency_code = "ron",
}: OrderSummaryProps) {
  return (
    <div className="panel" style={{ marginBottom: 0 }}>
      <div className="panel-head">
        <h3>Rezumat comanda</h3>
      </div>
      <div className="panel-body">
        <div style={rowStyle}>
          <span style={labelStyle}>Subtotal</span>
          <span style={valueStyle}><FormattedPrice value={fmt(subtotal, currency_code)} /></span>
        </div>

        {discount_total != null && discount_total > 0 && (
          <div style={rowStyle}>
            <span style={labelStyle}>Reducere</span>
            <span style={{ ...valueStyle, color: "var(--brand-600)" }}>
              <FormattedPrice value={`-${fmt(discount_total, currency_code)}`} />
            </span>
          </div>
        )}

        {shipping_total != null && shipping_total > 0 && (
          <div style={rowStyle}>
            <span style={labelStyle}>Transport</span>
            <span style={valueStyle}><FormattedPrice value={fmt(shipping_total, currency_code)} /></span>
          </div>
        )}

        {tax_total != null && tax_total > 0 && (
          <div style={rowStyle}>
            <span style={labelStyle}>TVA</span>
            <span style={valueStyle}><FormattedPrice value={fmt(tax_total, currency_code)} /></span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "12px 20px",
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: 14 }}>Total</span>
          <span style={{ fontFamily: "var(--f-mono)", fontVariantNumeric: "tabular-nums", fontSize: 15 }}>
            <FormattedPrice value={fmt(total, currency_code)} />
          </span>
        </div>
      </div>
    </div>
  )
}
