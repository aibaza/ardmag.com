"use client"

import { useEffect, useState } from "react"

interface QuantityStepperProps {
  defaultValue?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
  commitOnBlur?: boolean
  disabled?: boolean
}

export function QuantityStepper({
  defaultValue = 1,
  min = 1,
  max = 999,
  onChange,
  commitOnBlur = false,
  disabled = false,
}: QuantityStepperProps) {
  const clamp = (next: number) => Math.max(min, Math.min(max, next))
  const [value, setValue] = useState(() => clamp(defaultValue))
  const [text, setText] = useState(() => String(clamp(defaultValue)))

  useEffect(() => {
    const next = Math.max(min, Math.min(max, defaultValue))
    setValue(next)
    setText(String(next))
  }, [defaultValue, min, max])

  function update(next: number) {
    const clamped = clamp(next)
    setValue(clamped)
    setText(String(clamped))
    if (!commitOnBlur || clamped !== defaultValue) onChange?.(clamped)
  }

  return (
    <div className="qty-stepper">
      <button
        type="button"
        className="minus"
        aria-label="Scade cantitatea"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => update(value - 1)}
        disabled={disabled || value <= min}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={text}
        disabled={disabled}
        onChange={(e) => {
          const nextText = e.target.value
          if (!/^\d*$/.test(nextText)) return
          setText(nextText)
          const clamped = clamp(Number(nextText))
          setValue(clamped)
          if (!commitOnBlur && nextText !== "") onChange?.(clamped)
        }}
        onBlur={() => update(text === "" ? defaultValue : value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            e.currentTarget.blur()
          }
        }}
        aria-label="Cantitate"
        style={{ MozAppearance: "textfield" } as React.CSSProperties}
      />
      <button
        type="button"
        className="plus"
        aria-label="Crește cantitatea"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => update(value + 1)}
        disabled={disabled || value >= max}
      >
        +
      </button>
    </div>
  )
}
