"use client"

import * as React from "react"

// ---------------------------------------------------------------------------
// Field (server-compatible layout wrapper)
// ---------------------------------------------------------------------------

export interface FieldProps {
  label?: string
  hint?: string
  error?: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="font-[family-name:var(--f-mono)] text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--fg-muted)]"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[12px] text-[var(--error-fg)]">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-[var(--fg-muted)]">{hint}</p>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// InputShell (server-compatible border/focus wrapper)
// ---------------------------------------------------------------------------

type InputSize = "sm" | "md" | "lg"

export interface InputShellProps {
  size?: InputSize
  error?: boolean
  disabled?: boolean
  adornLeft?: React.ReactNode
  adornRight?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const shellHeightMap: Record<InputSize, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
}

export function InputShell({
  size = "md",
  error = false,
  disabled = false,
  adornLeft,
  adornRight,
  children,
  className = "",
}: InputShellProps) {
  return (
    <div
      className={[
        "flex items-stretch bg-white",
        "border rounded-[var(--r-sm)]",
        "transition-[border-color,box-shadow] duration-[80ms]",
        shellHeightMap[size],
        error
          ? "border-[var(--error)] focus-within:shadow-[0_0_0_3px_oklch(52%_0.20_25_/_0.25)]"
          : [
              "border-[var(--rule-strong)]",
              "hover:border-stone-400",
              "focus-within:border-brand-500 focus-within:shadow-[var(--focus-ring)]",
            ].join(" "),
        disabled
          ? "bg-stone-100 border-[var(--rule)] opacity-75 pointer-events-none"
          : "",
        className,
      ].join(" ")}
    >
      {adornLeft && (
        <div className="flex items-center px-[10px] border-r border-[var(--rule)] bg-stone-50 font-[family-name:var(--f-mono)] text-[12px] text-[var(--fg-muted)] shrink-0">
          {adornLeft}
        </div>
      )}
      {children}
      {adornRight && (
        <div className="flex items-center px-[10px] border-l border-[var(--rule)] bg-stone-50 font-[family-name:var(--f-mono)] text-[12px] text-[var(--fg-muted)] shrink-0">
          {adornRight}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TextInput
// ---------------------------------------------------------------------------

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ mono = false, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          "flex-1 min-w-0 bg-transparent border-none outline-none px-3",
          "text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-muted)]",
          mono
            ? "font-[family-name:var(--f-mono)]"
            : "font-[family-name:var(--f-sans)]",
          className,
        ].join(" ")}
        {...props}
      />
    )
  }
)

TextInput.displayName = "TextInput"

// ---------------------------------------------------------------------------
// SelectInput
// ---------------------------------------------------------------------------

const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`

export interface SelectInputProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  mono?: boolean
}

export const SelectInput = React.forwardRef<
  HTMLSelectElement,
  SelectInputProps
>(({ mono = false, className = "", style, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={[
        "flex-1 min-w-0 bg-transparent border-none outline-none px-3",
        "text-[14px] text-[var(--fg)] appearance-none cursor-pointer",
        mono
          ? "font-[family-name:var(--f-mono)]"
          : "font-[family-name:var(--f-sans)]",
        className,
      ].join(" ")}
      style={{
        backgroundImage: chevronSvg,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        paddingRight: "32px",
        ...style,
      }}
      {...props}
    />
  )
})

SelectInput.displayName = "SelectInput"

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

export interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  size?: "sm" | "md"
  disabled?: boolean
  className?: string
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max,
  step = 1,
  size = "md",
  disabled = false,
  className = "",
}: StepperProps) {
  const isMd = size === "md"
  const height = isMd ? "h-10" : "h-8"
  const btnWidth = isMd ? "w-8" : "w-7"
  const inputWidth = isMd ? "w-11" : "w-9"

  const decrement = () => {
    const next = value - step
    if (max === undefined || next >= min) onChange(Math.max(min, next))
  }

  const increment = () => {
    const next = value + step
    if (max === undefined || next <= max) onChange(next)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10)
    if (!isNaN(parsed)) {
      const clamped = max !== undefined ? Math.min(max, Math.max(min, parsed)) : Math.max(min, parsed)
      onChange(clamped)
    }
  }

  const atMin = value <= min
  const atMax = max !== undefined && value >= max

  return (
    <div
      className={[
        "inline-flex items-stretch bg-white",
        "border border-[var(--rule-strong)] rounded-[var(--r-sm)]",
        height,
        disabled ? "opacity-75 pointer-events-none" : "",
        className,
      ].join(" ")}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || atMin}
        aria-label="Decrease"
        className={[
          "flex items-center justify-center shrink-0 border-r border-[var(--rule-strong)]",
          "bg-stone-50 text-stone-700 font-[family-name:var(--f-mono)]",
          "hover:bg-stone-100 hover:text-stone-900",
          "disabled:opacity-45 disabled:pointer-events-none",
          "transition-colors duration-[80ms]",
          btnWidth,
        ].join(" ")}
      >
        <span aria-hidden>&#8722;</span>
      </button>

      <input
        type="number"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={[
          "flex-none text-center bg-transparent border-none outline-none",
          "font-[family-name:var(--f-mono)] text-[14px] text-[var(--fg)]",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          inputWidth,
        ].join(" ")}
      />

      <button
        type="button"
        onClick={increment}
        disabled={disabled || atMax}
        aria-label="Increase"
        className={[
          "flex items-center justify-center shrink-0 border-l border-[var(--rule-strong)]",
          "bg-stone-50 text-stone-700 font-[family-name:var(--f-mono)]",
          "hover:bg-stone-100 hover:text-stone-900",
          "disabled:opacity-45 disabled:pointer-events-none",
          "transition-colors duration-[80ms]",
          btnWidth,
        ].join(" ")}
      >
        <span aria-hidden>&#43;</span>
      </button>
    </div>
  )
}
