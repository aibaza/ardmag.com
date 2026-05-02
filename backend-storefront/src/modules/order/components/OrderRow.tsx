import { HttpTypes } from "@medusajs/types"

interface OrderRowProps {
  order: HttpTypes.StoreOrder
  countryCode: string
}

function getStatusInfo(status: string): { label: string; className: string } {
  switch (status) {
    case "pending":
      return { label: "In asteptare", className: "badge" }
    case "completed":
      return { label: "Finalizata", className: "badge stock-in" }
    case "cancelled":
      return { label: "Anulata", className: "badge" }
    default:
      return { label: status, className: "badge" }
  }
}

function formatTotal(amount: number, currencyCode?: string): string {
  const value = (amount / 100).toFixed(2).replace(".", ",")
  return `${value} ${(currencyCode ?? "RON").toUpperCase()}`
}

export function OrderRow({ order, countryCode }: OrderRowProps) {
  const date = new Date(order.created_at!).toLocaleDateString("ro-RO")
  const { label: statusLabel, className: statusClass } = getStatusInfo(order.status ?? "pending")
  const total = formatTotal(order.total ?? 0, order.currency_code)

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "90px 110px 1fr 110px auto",
        gap: 16,
        alignItems: "center",
        padding: "14px 20px",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <span style={{ fontFamily: "var(--f-mono)", fontWeight: 600, fontSize: 13 }}>
        #{order.display_id}
      </span>
      <span style={{ color: "var(--fg-muted)", fontSize: 13, fontFamily: "var(--f-mono)" }}>
        {date}
      </span>
      <span className={statusClass}>{statusLabel}</span>
      <span style={{ fontWeight: 600, fontFamily: "var(--f-mono)", fontSize: 13, textAlign: "right" }}>
        {total}
      </span>
      <a href={`/account/orders/details/${order.id}`} className="btn ghost sm">
        Detalii
      </a>
    </div>
  )
}
