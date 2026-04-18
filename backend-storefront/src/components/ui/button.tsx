"use client"

import * as React from "react"

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "inv"
type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  iconOnly?: boolean
}

const heightMap: Record<ButtonSize, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
}

const paddingMap: Record<ButtonSize, string> = {
  sm: "px-3",
  md: "px-4",
  lg: "px-5",
}

const textSizeMap: Record<ButtonSize, string> = {
  sm: "text-[13px]",
  md: "text-[14px]",
  lg: "text-[15px]",
}

const iconSizeMap: Record<ButtonSize, string> = {
  sm: "[&_svg]:w-[14px] [&_svg]:h-[14px]",
  md: "[&_svg]:w-[16px] [&_svg]:h-[16px]",
  lg: "[&_svg]:w-[18px] [&_svg]:h-[18px]",
}

const widthIconOnlyMap: Record<ButtonSize, string> = {
  sm: "w-8",
  md: "w-10",
  lg: "w-12",
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white border-brand-600 hover:bg-brand-600 hover:border-brand-700 active:bg-brand-700",
  secondary:
    "bg-white text-stone-900 border-stone-300 hover:bg-stone-100 hover:border-stone-400",
  ghost:
    "bg-transparent text-stone-800 border-transparent hover:bg-stone-100",
  destructive:
    "bg-[var(--error)] text-white border-[oklch(44%_0.18_25)] hover:bg-[oklch(46%_0.20_25)] hover:border-[oklch(44%_0.18_25)]",
  inv: "bg-white text-stone-900 border-white hover:bg-stone-100",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      iconOnly = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center gap-2 border font-medium select-none",
          "rounded-[var(--r-sm)]",
          "font-[family-name:var(--f-sans)]",
          "transition-[background-color,border-color,color] duration-[80ms]",
          "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
          "disabled:opacity-45 disabled:pointer-events-none",
          heightMap[size],
          textSizeMap[size],
          iconSizeMap[size],
          iconOnly
            ? `${widthIconOnlyMap[size]} px-0`
            : paddingMap[size],
          variantClasses[variant],
          className,
        ].join(" ")}
        {...props}
      >
        {loading && (
          <span
            aria-hidden
            className="w-[1em] h-[1em] rounded-full border-2 border-current border-t-transparent animate-spin"
          />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
