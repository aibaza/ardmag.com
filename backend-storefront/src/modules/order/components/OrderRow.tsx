import { HttpTypes } from "@medusajs/types"

interface OrderRowProps {
  order: HttpTypes.StoreOrder
  countryCode: string
}

function getStatusInfo(status: string): { label: string; className: string } {
  switch (status) {
    case "pending":
      return { label: "In asteptare", className: "badge stock-low" }
    case "completed":
      return { label: "Finalizata", className: "badge stock-in" }
    case "cancelled":
      return { label: "Anulata", className: "badge" }
    case "requires_action":
      return { label: "Actiune necesara", className: "badge stock-low" }
    default:
      return { label: status, className: "badge" }
  }
}

function formatTotal(amount: number, currencyCode?: string): string {
  return `${(amount / 100).toFixed(2).replace(".", ",")} ${(currencyCode ?? "RON").toUpperCase()}`
}

function formatRelativeDate(date: string | Date): string {
  const diffMs = Date.now() - new Date(date).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 1) return "azi"
  if (diffDays < 2) return "ieri"
  if (diffDays < 14) return `acum ${diffDays} ${diffDays === 1 ? "zi" : "zile"}`
  return new Date(date).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function OrderRow({ order }: OrderRowProps) {
  const dateLabel = formatRelativeDate(order.created_at ?? "")
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
      <span style={{ color: "var(--fg-muted)", fontSize: 12, fontFamily: "var(--f-mono)" }}>
        {dateLabel}
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
