"use client"

import * as React from "react"

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
        "inline-flex items-stretch bg-[var(--surface)]",
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
          "bg-[var(--stone-50)] text-stone-700 font-[family-name:var(--f-mono)]",
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
          "bg-[var(--stone-50)] text-stone-700 font-[family-name:var(--f-mono)]",
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
