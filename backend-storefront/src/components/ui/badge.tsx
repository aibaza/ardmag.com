import * as React from "react"

type BadgeVariant =
  | "stock-in"
  | "stock-low"
  | "stock-out"
  | "promo"
  | "new"
  | "brand"
  | "info"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  "stock-in":  "bg-[var(--success-bg)] text-[var(--success-fg)]",
  "stock-low": "bg-[var(--warning-bg)] text-[var(--warning-fg)]",
  "stock-out": "bg-stone-100 text-stone-600",
  promo:       "bg-brand-500 text-white",
  new:         "bg-stone-900 text-white",
  brand:       "bg-stone-100 text-stone-800 border border-[var(--rule)]",
  info:        "bg-[var(--info-bg)] text-[var(--info-fg)]",
}

export function Badge({
  variant = "brand",
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-[5px] whitespace-nowrap",
        "font-[family-name:var(--f-mono)]",
        "text-[10px] font-medium tracking-[0.04em] uppercase",
        "px-[7px] py-1 rounded-[var(--r-sm)]",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className="w-[6px] h-[6px] rounded-full bg-current opacity-90 shrink-0"
        />
      )}
      {children}
    </span>
  )
}
