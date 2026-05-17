interface SplitParts {
  int: string
  dec: string | null
  currency: string | null
}

export function splitFormattedPrice(value: string): SplitParts {
  const trimmed = value.trim()
  const isNegative = trimmed.startsWith("-")
  const body = isNegative ? trimmed.slice(1) : trimmed
  const m = body.match(/^([\d.]+)(?:,(\d+))?(?:\s+(.+))?$/)
  if (!m) return { int: value, dec: null, currency: null }
  return {
    int: (isNegative ? "-" : "") + m[1],
    dec: m[2] ?? null,
    currency: m[3]?.trim() ?? null,
  }
}

interface Props {
  value: string
  className?: string
}

export function FormattedPrice({ value, className }: Props) {
  const { int, dec, currency } = splitFormattedPrice(value)
  const classes = ["price", className].filter(Boolean).join(" ")
  return (
    <span className={classes}>
      <span className="price-int">{int}</span>
      {dec !== null && <span className="price-dec">,{dec}</span>}
      {currency && (
        <>
          {" "}
          <span className="price-currency">{currency}</span>
        </>
      )}
    </span>
  )
}
